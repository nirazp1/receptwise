// Custom JavaScript for SplitTracker

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            delay: { show: 300, hide: 100 }
        });
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
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
    }, {
        threshold: 0.1
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
                    // Trigger change event for validation
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
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
            
            // Add floating label effect
            if (control.hasAttribute('placeholder')) {
                const placeholder = control.getAttribute('placeholder');
                const wrapper = document.createElement('div');
                wrapper.className = 'floating-label-wrapper position-relative';
                
                const label = document.createElement('label');
                label.className = 'floating-label position-absolute text-muted small';
                label.textContent = placeholder;
                label.style.top = '0.75rem';
                label.style.left = '1rem';
                label.style.transition = 'all 0.2s ease';
                label.style.pointerEvents = 'none';
                label.style.opacity = '0';
                
                const parent = control.parentNode;
                parent.insertBefore(wrapper, control);
                wrapper.appendChild(control);
                wrapper.appendChild(label);
                
                control.addEventListener('focus', function() {
                    if (this.value === '') {
                        label.style.opacity = '0.7';
                        label.style.transform = 'translateY(-1.5rem) scale(0.85)';
                    }
                });
                
                control.addEventListener('blur', function() {
                    if (this.value === '') {
                        label.style.opacity = '0';
                        label.style.transform = 'translateY(0) scale(1)';
                    }
                });
                
                // Initialize if field already has value
                if (control.value !== '') {
                    label.style.opacity = '0.7';
                    label.style.transform = 'translateY(-1.5rem) scale(0.85)';
                }
            }
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
                    
                    // Add image click to enlarge
                    const previewImage = previewContainer.querySelector('.receipt-image');
                    if (previewImage) {
                        previewImage.addEventListener('click', function() {
                            const modal = document.createElement('div');
                            modal.className = 'modal fade';
                            modal.id = 'imagePreviewModal';
                            modal.setAttribute('tabindex', '-1');
                            modal.setAttribute('aria-hidden', 'true');
                            
                            modal.innerHTML = `
                                <div class="modal-dialog modal-dialog-centered modal-lg">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Receipt Preview</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body text-center">
                                            <img src="${e.target.result}" class="img-fluid" alt="Receipt preview">
                                        </div>
                                    </div>
                                </div>
                            `;
                            
                            document.body.appendChild(modal);
                            const modalInstance = new bootstrap.Modal(modal);
                            modalInstance.show();
                            
                            modal.addEventListener('hidden.bs.modal', function() {
                                document.body.removeChild(modal);
                            });
                        });
                        
                        // Add cursor pointer to indicate clickable
                        previewImage.style.cursor = 'pointer';
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
            
            // Add hover effect for better UX
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 0.5rem 1.5rem rgba(0, 0, 0, 0.05)';
            });
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
                    
                    // Send AJAX request to mark notification as read
                    fetch(`/notifications/mark-read/${notificationId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ notification_id: notificationId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Add fade-out animation
                            item.style.transition = 'all 0.5s ease';
                            item.style.opacity = '0';
                            item.style.transform = 'translateX(20px)';
                            
                            setTimeout(() => {
                                item.remove();
                                
                                // Update notification count
                                const notificationBadge = document.querySelector('.notification-badge');
                                if (notificationBadge) {
                                    const count = parseInt(notificationBadge.textContent) - 1;
                                    if (count > 0) {
                                        notificationBadge.textContent = count;
                                    } else {
                                        notificationBadge.remove();
                                    }
                                }
                            }, 500);
                        } else {
                            // Show error
                            this.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                            this.classList.remove('btn-outline-primary');
                            this.classList.add('btn-outline-danger');
                            
                            setTimeout(() => {
                                this.innerHTML = '<i class="fas fa-check"></i>';
                                this.classList.remove('btn-outline-danger');
                                this.classList.add('btn-outline-primary');
                                this.disabled = false;
                            }, 2000);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        this.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                        this.classList.remove('btn-outline-primary');
                        this.classList.add('btn-outline-danger');
                        
                        setTimeout(() => {
                            this.innerHTML = '<i class="fas fa-check"></i>';
                            this.classList.remove('btn-outline-danger');
                            this.classList.add('btn-outline-primary');
                            this.disabled = false;
                        }, 2000);
                    });
                });
            }
        });
    }
    
    // Enhance form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!this.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Find first invalid field and focus it
                const invalidField = this.querySelector(':invalid');
                if (invalidField) {
                    invalidField.focus();
                    
                    // Scroll to the invalid field with smooth animation
                    invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add shake animation to invalid field
                    invalidField.classList.add('shake-animation');
                    setTimeout(() => {
                        invalidField.classList.remove('shake-animation');
                    }, 800);
                }
            }
            
            form.classList.add('was-validated');
        });
    });
    
    // Lazy load images for better performance
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add dark mode toggle functionality
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Check for saved user preference
        const darkMode = localStorage.getItem('darkMode') === 'enabled';
        
        // Set initial state
        if (darkMode) {
            document.body.classList.add('dark-mode-enabled');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode-enabled');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode-enabled');
                localStorage.setItem('darkMode', null);
            }
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add responsive table handling
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
    
    // Add keyboard navigation for better accessibility
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            if (openModals.length > 0) {
                const modalInstance = bootstrap.Modal.getInstance(openModals[0]);
                if (modalInstance) modalInstance.hide();
            }
        }
    });
    
    // Add touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleSwipe = (element, leftCallback, rightCallback) => {
        element.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        element.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }, false);
        
        const handleSwipeGesture = () => {
            if (touchEndX < touchStartX - 100) {
                // Swiped left
                if (leftCallback) leftCallback();
            }
            
            if (touchEndX > touchStartX + 100) {
                // Swiped right
                if (rightCallback) rightCallback();
            }
        };
    };
    
    // Apply swipe to expense cards for mobile mark as paid
    const expenseItems = document.querySelectorAll('.expense-card');
    expenseItems.forEach(item => {
        const settleBtn = item.querySelector('.settle-btn');
        
        handleSwipe(
            item,
            () => {
                // Swipe left - show settle button
                if (settleBtn) {
                    settleBtn.style.display = 'block';
                    settleBtn.style.animation = 'fadeIn 0.3s ease forwards';
                }
            },
            () => {
                // Swipe right - hide settle button
                if (settleBtn) {
                    settleBtn.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        settleBtn.style.display = 'none';
                    }, 300);
                }
            }
        );
    });
    
    // Add CSS animation class
    document.querySelectorAll('[data-animation]').forEach(element => {
        const animation = element.dataset.animation;
        const delay = element.dataset.delay || 0;
        
        setTimeout(() => {
            element.classList.add(animation);
        }, delay);
    });
});

// Add keyframe animation for fadeOut if not already defined in CSS
if (!document.querySelector('style#custom-animations')) {
    const style = document.createElement('style');
    style.id = 'custom-animations';
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes shake-animation {
            0% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
            100% { transform: translateX(0); }
        }
        
        .shake-animation {
            animation: shake-animation 0.6s ease;
        }
    `;
    document.head.appendChild(style);
} 