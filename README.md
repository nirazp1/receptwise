# SplitTracker

A modern web application for tracking and splitting expenses with friends, family, or roommates. SplitTracker helps you manage group expenses, track balances, and settle up easily.

## Features

- **User Authentication**: Secure login and registration with email verification
- **Group Management**: Create and manage expense-sharing groups
- **Expense Tracking**: Add expenses with customizable splitting options (equal, exact amounts, percentages)
- **Balance Tracking**: Automatically calculated balances between users
- **Settlements**: Record and track payments between users
- **Notifications**: Real-time notifications for new expenses, settlements, and more
- **File Uploads**: Attach receipts to expenses for better record-keeping
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Backend**: Django 5.0.2, Django REST Framework, Django Channels
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Authentication**: django-allauth
- **Real-time**: Django Channels
- **UI Components**: Crispy Forms, Bootstrap 5
- **File Storage**: Local storage (development), AWS S3 (production-ready)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/splittracker.git
cd splittracker
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the project root with the following variables:
```
SECRET_KEY=your_secret_key_here
DEBUG=True
```

5. Apply migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

8. Access the application at http://127.0.0.1:8000/

## Project Structure

```
splittracker/
├── finance_tracker_web/      # Django project settings
├── tracker/                  # Main application
│   ├── migrations/           # Database migrations
│   ├── models.py             # Data models
│   ├── views.py              # View functions
│   ├── urls.py               # URL routing
│   ├── forms.py              # Form definitions
│   └── templatetags/         # Custom template tags
├── templates/                # HTML templates
│   ├── account/              # Authentication templates
│   └── tracker/              # Application templates
├── static/                   # Static files (CSS, JS)
├── media/                    # User-uploaded files
├── requirements.txt          # Project dependencies
└── manage.py                 # Django management script
```

## Development

- Use `python manage.py makemigrations` to create new migrations
- Use `python manage.py migrate` to apply migrations
- Use `python manage.py runserver` to start the development server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request
