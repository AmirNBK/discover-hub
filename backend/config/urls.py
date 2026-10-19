from django.urls import path

from explorer import catalogue_views, views

urlpatterns = [
    path("api/health", views.health),
    path("api/auth/<str:action>", views.auth),
    path("api/contact", views.contact),
    path("api/places", views.places),
    path("api/destinations", catalogue_views.catalogue),
    path("api/destinations/<slug:slug>", catalogue_views.destination),
    path("api/saved", catalogue_views.saved),
    path("api/saved/import", catalogue_views.import_saved),
]
handler404 = "explorer.views.not_found"
