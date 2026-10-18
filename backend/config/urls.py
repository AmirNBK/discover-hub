from django.urls import path

from explorer import views

urlpatterns = [
    path("api/health", views.health),
    path("api/auth/<str:action>", views.auth),
    path("api/contact", views.contact),
    path("api/places", views.places),
]
handler404 = "explorer.views.not_found"
