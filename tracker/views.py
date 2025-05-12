from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Q
from django.http import JsonResponse
from .models import Group, GroupMember, Expense, ExpenseShare, Settlement, Comment, Notification
from .forms import GroupForm, ExpenseForm, ExpenseShareForm, SettlementForm, CommentForm

# Create your views here.

# Add Transaction View
@login_required
def add_transaction(request):
    if request.method == 'POST':
        form = TransactionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('tracker:transaction_list')
    else:
        form = TransactionForm()
    return render(request, 'tracker/add_transaction.html', {'form': form})

# List Transactions View
def transaction_list(request):
    transactions = Transaction.objects.order_by('-date', '-id')
    return render(request, 'tracker/transaction_list.html', {'transactions': transactions})

# Summary View
def summary(request):
    income = Transaction.objects.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
    expenses = Transaction.objects.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
    balance = income - expenses
    category_summary = Transaction.objects.filter(type='expense').values('category').annotate(total=Sum('amount')).order_by('-total')
    return render(request, 'tracker/summary.html', {
        'income': income,
        'expenses': expenses,
        'balance': balance,
        'category_summary': category_summary,
    })

@login_required
def dashboard(request):
    user_groups = Group.objects.filter(members=request.user)
    recent_expenses = Expense.objects.filter(
        Q(group__in=user_groups) | Q(paid_by=request.user)
    ).order_by('-date')[:5]
    
    # Get user's balances
    balances = {}
    for group in user_groups:
        paid = Expense.objects.filter(group=group, paid_by=request.user).aggregate(total=Sum('amount'))['total'] or 0
        owed = ExpenseShare.objects.filter(expense__group=group, user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        balances[group] = paid - owed
    
    context = {
        'user_groups': user_groups,
        'recent_expenses': recent_expenses,
        'balances': balances,
    }
    return render(request, 'tracker/dashboard.html', context)

@login_required
def group_list(request):
    groups = Group.objects.filter(members=request.user)
    
    # Calculate balances for each group
    balances = {}
    for group in groups:
        paid = Expense.objects.filter(group=group, paid_by=request.user).aggregate(total=Sum('amount'))['total'] or 0
        owed = ExpenseShare.objects.filter(expense__group=group, user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        balances[group] = paid - owed
    
    context = {
        'groups': groups,
        'balances': balances,
    }
    return render(request, 'tracker/group_list.html', context)

@login_required
def group_detail(request, group_id):
    group = get_object_or_404(Group, id=group_id, members=request.user)
    expenses = Expense.objects.filter(group=group).order_by('-date')
    members = group.members.all()
    
    # Calculate balances for each member
    balances = {}
    for member in members:
        paid = Expense.objects.filter(group=group, paid_by=member).aggregate(total=Sum('amount'))['total'] or 0
        owed = ExpenseShare.objects.filter(expense__group=group, user=member).aggregate(total=Sum('amount'))['total'] or 0
        balances[member] = paid - owed
    
    context = {
        'group': group,
        'expenses': expenses,
        'members': members,
        'balances': balances,
    }
    return render(request, 'tracker/group_detail.html', context)

@login_required
def group_create(request):
    if request.method == 'POST':
        form = GroupForm(request.POST, request.FILES)
        if form.is_valid():
            group = form.save()
            GroupMember.objects.create(user=request.user, group=group, role='admin')
            messages.success(request, 'Group created successfully!')
            return redirect('tracker:group_detail', group_id=group.id)
    else:
        form = GroupForm()
    return render(request, 'tracker/group_form.html', {'form': form})

@login_required
def expense_create(request, group_id):
    group = get_object_or_404(Group, id=group_id, members=request.user)
    if request.method == 'POST':
        form = ExpenseForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.paid_by = request.user
            expense.group = group
            expense.save()
            
            # Create expense shares based on split type
            if expense.split_type == 'equal':
                share_amount = expense.amount / group.members.count()
                for member in group.members.all():
                    ExpenseShare.objects.create(
                        expense=expense,
                        user=member,
                        amount=share_amount
                    )
            
            messages.success(request, 'Expense added successfully!')
            return redirect('tracker:group_detail', group_id=group.id)
    else:
        form = ExpenseForm(user=request.user)
    return render(request, 'tracker/expense_form.html', {'form': form, 'group': group})

@login_required
def expense_detail(request, expense_id):
    expense = get_object_or_404(Expense, id=expense_id)
    if not expense.group or request.user not in expense.group.members.all():
        messages.error(request, 'You do not have permission to view this expense.')
        return redirect('tracker:dashboard')
    
    shares = expense.shares.all()
    comments = expense.comments.all().order_by('-created_at')
    
    if request.method == 'POST':
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            comment = comment_form.save(commit=False)
            comment.expense = expense
            comment.user = request.user
            comment.save()
            return redirect('tracker:expense_detail', expense_id=expense.id)
    else:
        comment_form = CommentForm()
    
    context = {
        'expense': expense,
        'shares': shares,
        'comments': comments,
        'comment_form': comment_form,
    }
    return render(request, 'tracker/expense_detail.html', context)

@login_required
def settlement_create(request, group_id):
    group = get_object_or_404(Group, id=group_id, members=request.user)
    if request.method == 'POST':
        form = SettlementForm(request.POST, user=request.user, group=group)
        if form.is_valid():
            settlement = form.save(commit=False)
            settlement.payer = request.user
            settlement.group = group
            settlement.save()
            
            # Create notification for receiver
            Notification.objects.create(
                user=settlement.receiver,
                type='settlement_request',
                content=f'{request.user.username} requested a settlement of ${settlement.amount}',
                related_settlement=settlement,
                related_group=group
            )
            
            messages.success(request, 'Settlement request sent successfully!')
            return redirect('tracker:group_detail', group_id=group.id)
    else:
        form = SettlementForm(user=request.user, group=group)
    return render(request, 'tracker/settlement_form.html', {'form': form, 'group': group})

@login_required
def settlement_approve(request, settlement_id):
    settlement = get_object_or_404(Settlement, id=settlement_id, receiver=request.user)
    if request.method == 'POST':
        settlement.status = 'completed'
        settlement.save()
        
        # Create notification for payer
        Notification.objects.create(
            user=settlement.payer,
            type='settlement_completed',
            content=f'{request.user.username} approved your settlement of ${settlement.amount}',
            related_settlement=settlement,
            related_group=settlement.group
        )
        
        messages.success(request, 'Settlement approved successfully!')
    return redirect('tracker:group_detail', group_id=settlement.group.id)

@login_required
def notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    unread_count = notifications.filter(is_read=False).count()
    
    if request.method == 'POST':
        notification_id = request.POST.get('notification_id')
        if notification_id:
            notification = get_object_or_404(Notification, id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return JsonResponse({'status': 'success'})
    
    return render(request, 'tracker/notifications.html', {
        'notifications': notifications,
        'unread_count': unread_count
    })

@login_required
def expense_delete(request, expense_id):
    expense = get_object_or_404(Expense, id=expense_id)
    
    # Only the user who paid for the expense can delete it
    if expense.paid_by != request.user:
        messages.error(request, 'You do not have permission to delete this expense.')
        return redirect('tracker:expense_detail', expense_id=expense.id)
    
    group_id = expense.group.id
    if request.method == 'POST':
        expense.delete()
        messages.success(request, 'Expense deleted successfully!')
        return redirect('tracker:group_detail', group_id=group_id)
    
    return redirect('tracker:expense_detail', expense_id=expense.id)
