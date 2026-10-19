from django.conf import settings
from django.http import JsonResponse

from .security import valid_proxy_token


class BackendProxyMiddleware:
    """Hosted Django accepts application requests only from its frontend service."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.REQUIRE_BACKEND_PROXY_TOKEN and not valid_proxy_token(request):
            response = JsonResponse(
                {"error": "Access this service through the application website."},
                status=403,
            )
            response["Cache-Control"] = "no-store"
            return response
        return self.get_response(request)
