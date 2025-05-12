from django.contrib import admin
from .models import Group, GroupMember, Expense, ExpenseShare, Settlement, Comment, Notification

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'get_member_count')
    search_fields = ('name', 'description')
    
    def get_member_count(self, obj):
        return obj.members.count()
    get_member_count.short_description = 'Members'

@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'role', 'joined_at')
    list_filter = ('role', 'group')
    search_fields = ('user__email', 'group__name')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'paid_by', 'group', 'date', 'split_type')
    list_filter = ('split_type', 'group', 'date')
    search_fields = ('title', 'description', 'paid_by__email')
    date_hierarchy = 'date'

@admin.register(ExpenseShare)
class ExpenseShareAdmin(admin.ModelAdmin):
    list_display = ('expense', 'user', 'amount', 'percentage')
    list_filter = ('expense__group', 'user')
    search_fields = ('expense__title', 'user__email')

@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ('payer', 'receiver', 'amount', 'status', 'date', 'group')
    list_filter = ('status', 'group', 'date')
    search_fields = ('payer__email', 'receiver__email', 'notes')
    date_hierarchy = 'date'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'expense', 'created_at', 'updated_at')
    list_filter = ('created_at', 'expense__group')
    search_fields = ('text', 'user__email', 'expense__title')
    date_hierarchy = 'created_at'

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('content', 'user__email')
    date_hierarchy = 'created_at'
