from .models import Group

def user_groups(request):
    """
    Add user_groups to all template contexts if the user is authenticated
    """
    context = {}
    try:
        if request.user.is_authenticated:
            context['user_groups'] = list(Group.objects.filter(members=request.user))
        else:
            context['user_groups'] = []
    except Exception:
        # Fallback in case of any error
        context['user_groups'] = []
    
    # Always ensure unread_count is available to avoid template errors
    context['unread_count'] = 0
    
    return context 