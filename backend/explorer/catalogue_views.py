from django.db.models import Q
from django.http import JsonResponse

from .catalogue import valid_slug, validate_ids
from .models import Destination, SavedPlace
from .security import current_account
from .views import api, saved_ids


@api(["GET", "POST"])
def catalogue(request, data):
    params = data if request.method == "POST" else request.GET
    try:
        query, category = params.get("q", ""), params.get("category", "All places")
        if (
            not isinstance(query, str)
            or len(query) > 100
            or not isinstance(category, str)
            or len(category) > 40
        ):
            raise ValueError(
                "Use a search of up to 100 characters and a valid category."
            )
        limit, offset = params.get("limit", 12), params.get("offset", 0)
        if (
            isinstance(limit, bool)
            or isinstance(offset, bool)
            or str(limit) != str(int(limit))
            or str(offset) != str(int(offset))
        ):
            raise ValueError("Pagination must use whole numbers.")
        limit, offset = int(limit), int(offset)
        if not 1 <= limit <= 50 or not 0 <= offset <= 1000000:
            raise ValueError("Use a limit of 1–50 and an offset of 0–1000000.")
        places = Destination.objects.filter(published=True)
        categories = list(
            places.order_by("category").values_list("category", flat=True).distinct()
        )
        if category == "Saved":
            account = current_account(request)
            if "accountId" in params and params.get("accountId") != (
                str(account.pk) if account else None
            ):
                return JsonResponse(
                    {
                        "error": "Your account changed. Refresh your connection to see saved places."
                    },
                    status=409,
                )
            ids = saved_ids(account) if account else validate_ids(params.get("ids", []))
            places = places.filter(slug__in=ids)
        elif category != "All places":
            places = places.filter(category=category)
        if query.strip():
            term = query.strip()
            places = places.filter(
                Q(name__icontains=term)
                | Q(country__icontains=term)
                | Q(region__icontains=term)
                | Q(category__icontains=term)
            )
        total = places.count()
        focus = params.get("focus")
        if focus is not None and not valid_slug(focus):
            raise ValueError("Use a valid destination ID for focus.")
        if focus and "offset" not in params:
            selected = places.filter(slug=focus).first()
            if selected:
                rank = places.filter(
                    Q(sort_order__lt=selected.sort_order)
                    | Q(sort_order=selected.sort_order, slug__lt=selected.slug)
                ).count()
                offset = (rank // limit) * limit
        # Removing the final item on a page returns the previous valid page.
        offset = min(offset, ((max(total, 1) - 1) // limit) * limit)
        return JsonResponse(
            {
                "destinations": [p.public() for p in places[offset : offset + limit]],
                "total": total,
                "offset": offset,
                "limit": limit,
                "categories": categories,
            }
        )
    except (ValueError, TypeError, OverflowError):
        return JsonResponse(
            {
                "error": "Invalid catalogue filters. Use valid search text, destination IDs, and pagination."
            },
            status=400,
        )


@api(["GET"])
def destination(request, data, slug):
    place = Destination.objects.filter(slug=slug, published=True).first()
    if place is None:
        return JsonResponse({"error": "Destination not found."}, status=404)
    return JsonResponse({"destination": place.public()})


def saved_account(request, data):
    user = current_account(request)
    if user is None:
        return None, JsonResponse(
            {"error": "Please sign in to sync your saved places."}, status=401
        )
    if data.get("accountId") != str(user.pk) and request.method == "POST":
        return None, JsonResponse(
            {"error": "Your account changed. Refresh the page and try again."},
            status=409,
        )
    return user, None


@api(["GET", "POST"])
def saved(request, data):
    user, error = saved_account(request, data)
    if error is not None:
        return error
    if request.method == "GET":
        return JsonResponse({"saved": saved_ids(user), "accountId": str(user.pk)})
    slug, enabled = data.get("id"), data.get("saved")
    if not valid_slug(slug) or type(enabled) is not bool:
        return JsonResponse(
            {"error": "Use a destination ID and a boolean saved value."}, status=400
        )
    place = Destination.objects.filter(slug=slug, published=True).first()
    if place is None:
        return JsonResponse(
            {"error": "This destination is no longer available."}, status=404
        )
    if enabled:
        SavedPlace.objects.get_or_create(user=user, destination=place)
    else:
        SavedPlace.objects.filter(user=user, destination=place).delete()
    return JsonResponse({"id": slug, "saved": enabled, "accountId": str(user.pk)})


@api(["POST"])
def import_saved(request, data):
    user, error = saved_account(request, data)
    if error is not None:
        return error
    try:
        ids = validate_ids(data.get("ids"))
    except ValueError as error:
        return JsonResponse({"error": str(error)}, status=400)
    accepted = []
    for place in Destination.objects.filter(slug__in=ids, published=True):
        SavedPlace.objects.get_or_create(user=user, destination=place)
        accepted.append(place.slug)
    return JsonResponse(
        {"saved": saved_ids(user), "accepted": accepted, "accountId": str(user.pk)}
    )
