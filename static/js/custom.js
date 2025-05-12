// Custom JavaScript for SplitTracker

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Animated counters for stat values
    const animateStats = () => {
        const statValues = document.querySelectorAll('.stat-value');
        
        statValues.forEach(stat => {
            // Skip if not a numeric value
            if (isNaN(parseFloat(stat.textContent.replace(/[^0-9.-]+/g, '')))) return;
            
            const value = parseFloat(stat.textContent.replace(/[^0-9.-]+/g, ''));
            const prefix = stat.textContent.includes('$') ? '$' : '';
            let startValue = 0;
            
            // Update counter with animation
            const counter = setInterval(function() {
                startValue += value / 20;
                
                if (startValue >= value) {
                    clearInterval(counter);
                    stat.textContent = `${prefix}${value.toFixed(2)}`;
                } else {
                    stat.textContent = `${prefix}${startValue.toFixed(2)}`;
                }
            }, 30);
        });
    };
    
    // Run stats animation when they become visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    const statsContainer = document.querySelector('.row.mb-4');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }
    
    // Handle expense share calculations
    const splitTypeSelect = document.getElementById('id_split_type');
    const amountInput = document.getElementById('id_amount');
    
    if (splitTypeSelect && amountInput) {
        const updateShares = function() {
            const splitType = splitTypeSelect.value;
            const amount = parseFloat(amountInput.value) || 0;
            const sharesContainer = document.getElementById('shares-container');
            
            if (!sharesContainer) return;
            
            const memberInputs = sharesContainer.querySelectorAll('.share-amount');
            const memberCount = memberInputs.length;
            
            if (splitType === 'equal' && amount > 0) {
                const shareAmount = amount / memberCount;
                memberInputs.forEach(input => {
                    input.value = shareAmount.toFixed(2);
                });
            }
        };
        
        splitTypeSelect.addEventListener('change', updateShares);
        amountInput.addEventListener('input', updateShares);
        
        // Initial calculation
        if (splitTypeSelect.value === 'equal') {
            updateShares();
        }
    }
    
    // Smooth form transitions
    const enhanceFormExperience = () => {
        // Highlight active input field
        const formControls = document.querySelectorAll('.form-control');
        
        formControls.forEach(control => {
            control.addEventListener('focus', function() {
                this.closest('.form-group')?.classList.add('form-group-active');
            });
            
            control.addEventListener('blur', function() {
                this.closest('.form-group')?.classList.remove('form-group-active');
            });
        });
    };
    
    enhanceFormExperience();
    
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.querySelector(this.getAttribute('toggle'));
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    }
    
    // Expense image preview with better UX
    const receiptInput = document.getElementById('id_receipt');
    if (receiptInput) {
        receiptInput.addEventListener('change', function() {
            const previewContainer = document.getElementById('receipt-preview');
            if (!previewContainer) return;
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                // Show loading state
                previewContainer.innerHTML = `
                    <div class="mt-3 text-center">
                        <div class="loading mb-3"></div>
                        <p class="text-muted">Preparing preview...</p>
                    </div>
                `;
                
                reader.onload = function(e) {
                    previewContainer.innerHTML = `
                        <div class="mt-3" data-aos="fade-in">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <p class="mb-0">Image Preview:</p>
                                <button type="button" class="btn btn-sm btn-outline-danger remove-preview">
                                    <i class="fas fa-times"></i> Remove
                                </button>
                            </div>
                            <img src="${e.target.result}" class="img-fluid receipt-image" alt="Receipt preview">
                        </div>
                    `;
                    
                    // Handle remove button
                    const removeBtn = previewContainer.querySelector('.remove-preview');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function() {
                            receiptInput.value = '';
                            previewContainer.innerHTML = '';
                        });
                    }
                };
                
                reader.readAsDataURL(this.files[0]);
            } else {
                previewContainer.innerHTML = '';
            }
        });
    }
    
    // Interactive expense list items
    const expenseCards = document.querySelectorAll('.expense-card');
    if (expenseCards.length > 0) {
        expenseCards.forEach((card, index) => {
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', `${100 + (index * 50)}`);
        });
    }
    
    // Mark notification as read with improved UX
    const notificationItems = document.querySelectorAll('.notification-item');
    if (notificationItems.length > 0) {
        notificationItems.forEach((item, index) => {
            // Add animation delay for staggered appearance
            item.setAttribute('data-aos', 'fade-up');
            item.setAttribute('data-aos-delay', `${100 + (index * 50)}`);
            
            // Mark as read functionality
            const markReadBtn = item.querySelector('.mark-read');
            if (markReadBtn) {
                markReadBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const notificationId = this.dataset.notificationId;
                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                    
                    // Show loading state
                    this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
                    this.disabled = true;
                    
                    fetch('/notifications/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-CSRFToken': csrfToken
                        },
                        body: `notification_id=${notificationId}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            // Add fade-out animation
                            item.style.transition = 'all 0.3s ease';
                            item.style.opacity = '0.5';
                            
                            // Remove highlight
                            setTimeout(() => {
                                item.classList.remove('bg-light');
                                item.style.opacity = '1';
                                
                                // Remove mark read button
                                this.remove();
                                
                                // Update badge count
                                const badge = document.querySelector('.notification-badge');
                                if (badge) {
                                    const count = parseInt(badge.textContent) - 1;
                                    if (count > 0) {
                                        badge.textContent = count;
                                    } else {
                                        badge.remove();
                                    }
                                }
                            }, 300);
                        }
                    });
                });
            }
        });
    }
    
    // Mark all notifications as read with improved UX
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            // Show loading state
            this.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Marking all as read...';
            this.disabled = true;
            
            const notificationIds = Array.from(document.querySelectorAll('.notification-item'))
                .map(item => item.dataset.notificationId);
                
            Promise.all(notificationIds.map(id => {
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                
                return fetch('/notifications/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrfToken
                    },
                    body: `notification_id=${id}`
                }).then(response => response.json());
            }))
            .then(() => {
                // Add success animation
                this.innerHTML = '<i class="fas fa-check me-2"></i>All marked as read';
                this.classList.remove('btn-primary');
                this.classList.add('btn-success');
                
                setTimeout(() => {
                    // Remove highlighting
                    document.querySelectorAll('.notification-item').forEach(item => {
                        item.classList.remove('bg-light');
                    });
                    
                    // Remove mark read buttons
                    document.querySelectorAll('.mark-read').forEach(btn => {
                        btn.remove();
                    });
                    
                    // Remove badge
                    const badge = document.querySelector('.notification-badge');
                    if (badge) badge.remove();
                    
                    // Remove the mark all read button
                    this.remove();
                }, 1000);
            });
        });
    }
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}); 