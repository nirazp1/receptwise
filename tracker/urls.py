from django.urls import path
from . import views

app_name = 'tracker'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('groups/', views.group_list, name='group_list'),
    path('groups/create/', views.group_create, name='group_create'),
    path('groups/<int:group_id>/', views.group_detail, name='group_detail'),
    path('groups/<int:group_id>/expenses/create/', views.expense_create, name='expense_create'),
    path('expenses/<int:expense_id>/', views.expense_detail, name='expense_detail'),
    path('expenses/<int:expense_id>/delete/', views.expense_delete, name='expense_delete'),
    path('groups/<int:group_id>/settlements/create/', views.settlement_create, name='settlement_create'),
    path('settlements/<int:settlement_id>/approve/', views.settlement_approve, name='settlement_approve'),
    path('notifications/', views.notifications, name='notifications'),
] 