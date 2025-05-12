from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Group, Expense, ExpenseShare, Settlement, Comment
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Layout, Field, Div

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Sign Up', css_class='btn btn-primary'))

class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name', 'description', 'cover_photo']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Create Group', css_class='btn btn-primary'))

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['title', 'amount', 'description', 'group', 'split_type', 'currency', 'receipt']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['group'].queryset = user.group_set.all()
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Add Expense', css_class='btn btn-primary'))

class ExpenseShareForm(forms.ModelForm):
    class Meta:
        model = ExpenseShare
        fields = ['user', 'amount', 'percentage']
    
    def __init__(self, *args, **kwargs):
        expense = kwargs.pop('expense', None)
        super().__init__(*args, **kwargs)
        if expense and expense.group:
            self.fields['user'].queryset = expense.group.members.all()
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Add Share', css_class='btn btn-primary'))

class SettlementForm(forms.ModelForm):
    class Meta:
        model = Settlement
        fields = ['receiver', 'amount', 'payment_method', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 2}),
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        group = kwargs.pop('group', None)
        super().__init__(*args, **kwargs)
        if user and group:
            self.fields['receiver'].queryset = group.members.exclude(id=user.id)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Request Settlement', css_class='btn btn-primary'))

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['text']
        widgets = {
            'text': forms.Textarea(attrs={'rows': 2, 'placeholder': 'Add a comment...'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Post Comment', css_class='btn btn-primary')) 