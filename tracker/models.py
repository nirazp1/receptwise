from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal

# Create your models here.

class Transaction(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]

    date = models.DateField(auto_now_add=True)
    type = models.CharField(max_length=7, choices=TYPE_CHOICES)
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.date} - {self.type} - {self.category} - {self.amount}"

class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, through='GroupMember')
    cover_photo = models.ImageField(upload_to='group_covers/', null=True, blank=True)
    
    def __str__(self):
        return self.name

class GroupMember(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'group')

class Expense(models.Model):
    SPLIT_CHOICES = [
        ('equal', 'Equal'),
        ('exact', 'Exact Amounts'),
        ('percent', 'Percentages'),
    ]
    
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    description = models.TextField(blank=True)
    date = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True)
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses_paid')
    split_type = models.CharField(max_length=10, choices=SPLIT_CHOICES, default='equal')
    currency = models.CharField(max_length=3, default='USD')
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - ${self.amount}"

class ExpenseShare(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ('expense', 'user')

class Settlement(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='settlements_paid')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='settlements_received')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.payer} → {self.receiver}: ${self.amount}"

class Comment(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment by {self.user} on {self.expense}"

class Notification(models.Model):
    TYPE_CHOICES = [
        ('expense_added', 'New Expense'),
        ('expense_updated', 'Expense Updated'),
        ('settlement_request', 'Settlement Request'),
        ('settlement_completed', 'Settlement Completed'),
        ('group_invite', 'Group Invitation'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    related_expense = models.ForeignKey(Expense, on_delete=models.CASCADE, null=True, blank=True)
    related_settlement = models.ForeignKey(Settlement, on_delete=models.CASCADE, null=True, blank=True)
    related_group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return f"{self.type} - {self.user}"
