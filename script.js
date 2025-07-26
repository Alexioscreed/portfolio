// ===== NAVIGATION FUNCTIONALITY =====
class Portfolio {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.contactForm = document.getElementById('contact-form');
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        
        // Initialize EmailJS
        this.initEmailJS();
        
        this.init();
    }

    initEmailJS() {
        // Initialize EmailJS with your public key
        if (typeof emailjs !== 'undefined') {
            emailjs.init("YOUR_PUBLIC_KEY"); // You'll need to replace this
        }
    }

    init() {
        this.setupEventListeners();
        this.updateActiveNavOnScroll();
        this.handleNavbarBackground();
        this.setupSmoothScrolling();
        this.setupFormHandler();
        this.setupAnimations();
        this.initializeTheme();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.navToggle?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close mobile menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu?.contains(e.target) && !this.navToggle?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.updateActiveNavOnScroll();
            this.handleNavbarBackground();
        });

        // Form submission
        this.contactForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Theme toggle
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    }

    toggleMobileMenu() {
        this.navToggle?.classList.toggle('active');
        this.navMenu?.classList.toggle('active');
        document.body.style.overflow = this.navMenu?.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.navToggle?.classList.remove('active');
        this.navMenu?.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateActiveNavOnScroll() {
        const scrollY = window.pageYOffset;
        
        this.sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.navLinks.forEach(link => link.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    }

    handleNavbarBackground() {
        if (window.scrollY > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Scroll indicator in hero section
        const scrollIndicator = document.querySelector('.scroll-indicator');
        scrollIndicator?.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    setupFormHandler() {
        // Add real-time validation
        const formInputs = this.contactForm?.querySelectorAll('input, textarea');
        formInputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        existingError?.remove();

        // Validation rules
        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'subject':
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Subject must be at least 3 characters long';
                }
                break;
            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long';
                }
                break;
        }

        if (!isValid) {
            field.classList.add('error');
            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.style.display = 'block';
            field.parentNode.appendChild(errorElement);
        }

        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        errorMessage?.remove();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.contactForm);
        const formObject = Object.fromEntries(formData);
        
        // Validate all fields
        const formInputs = this.contactForm.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        formInputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        const submitButton = this.contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        submitButton.classList.add('loading');

        try {
            // Send email using Netlify Forms or fallback
            await this.sendFormSubmission(this.contactForm);
            
            // Success
            this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.contactForm.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    }

    async sendFormSubmission(form) {
        const formData = new FormData(form);
        
        // Try Netlify Forms first (if hosted on Netlify)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString()
                });
                
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                console.log('Netlify form submission failed, using fallback');
            }
        }
        
        // Fallback to mailto
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        const mailtoLink = `mailto:lhusajo.ngulwa@gmail.com?subject=${encodeURIComponent(`Portfolio Contact: ${subject}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        return new Promise((resolve) => {
            setTimeout(() => {
                window.open(mailtoLink, '_blank');
                resolve();
            }, 500);
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        existingNotification?.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: '9999',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });

        // Add close button styles
        const closeButton = notification.querySelector('.notification-close');
        Object.assign(closeButton.style, {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Manual close
        closeButton.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.skill-item, .project-card, .stat-item');
        animateElements.forEach(el => observer.observe(el));
    }

    // ===== THEME FUNCTIONALITY =====
    initializeTheme() {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(currentTheme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle icon
        if (this.themeIcon) {
            if (theme === 'dark') {
                this.themeIcon.className = 'bx bx-sun';
                this.themeToggle.title = 'Switch to Light Mode';
            } else {
                this.themeIcon.className = 'bx bx-moon';
                this.themeToggle.title = 'Switch to Dark Mode';
            }
        }
        
        // Update meta theme-color for mobile browsers
        let metaThemeColor = document.querySelector('meta[name=theme-color]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    }
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main portfolio functionality
    new Portfolio();
    
    // Add loading animation completion
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// ===== PERFORMANCE OPTIMIZATION =====
// Lazy load images when implemented
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Could implement error reporting here
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});