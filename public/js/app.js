// Smart Taxis MVP - Client-side JavaScript

// Global variables
let currentBookingId = null;
let refreshInterval = null;
let notificationPermission = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    requestNotificationPermission();
    startAutoRefresh();
});

// Initialize application
function initializeApp() {
    console.log('Smart Taxis MVP initialized');
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize modals
    initializeModals();
    
    // Update current time
    updateCurrentTime();
    
    // Check for saved booking ID
    currentBookingId = localStorage.getItem('currentBookingId');
    
    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'home':
            initializeHomePage();
            break;
        case 'booking':
            initializeBookingPage();
            break;
        case 'missions':
            initializeMissionsPage();
            break;
        case 'drivers':
            initializeDriversPage();
            break;
    }
}

// Get current page
function getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index') return 'home';
    if (path.includes('/book')) return 'booking';
    if (path.includes('/missions')) return 'missions';
    if (path.includes('/drivers')) return 'drivers';
    return 'unknown';
}

// Setup event listeners
function setupEventListeners() {
    // Navigation active state
    updateActiveNavigation();
    
    // Form validation
    setupFormValidation();
    
    // Button click handlers
    setupButtonHandlers();
    
    // Window events
    window.addEventListener('beforeunload', saveAppState);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize modals
function initializeModals() {
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        });
    });
}

// Update current time
function updateCurrentTime() {
    const timeElements = document.querySelectorAll('.current-time');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    timeElements.forEach(element => {
        element.textContent = timeString;
    });
    
    // Update every second
    setTimeout(updateCurrentTime, 1000);
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission === 'granted';
        });
    }
}

// Show notification
function showNotification(title, message, type = 'info') {
    if (notificationPermission) {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        });
    }
    
    // Also show toast notification
    showToast(title, message, type);
}

// Show toast notification
function showToast(title, message, type = 'info') {
    const toastContainer = getOrCreateToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getBootstrapColorClass(type)} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Get or create toast container
function getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }
    return container;
}

// Get Bootstrap color class
function getBootstrapColorClass(type) {
    const colorMap = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return colorMap[type] || 'info';
}

// Update active navigation
function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '/' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        }
    });
}

// Setup form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                showToast('Validation Error', 'Please fill in all required fields correctly.', 'error');
            }
            form.classList.add('was-validated');
        });
    });
}

// Setup button handlers
function setupButtonHandlers() {
    // Refresh buttons
    document.querySelectorAll('[data-action="refresh"]').forEach(button => {
        button.addEventListener('click', () => {
            location.reload();
        });
    });
    
    // Copy buttons
    document.querySelectorAll('[data-action="copy"]').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-copy-text') || this.textContent;
            copyToClipboard(text);
        });
    });
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied', 'Text copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Error', 'Failed to copy text to clipboard.', 'error');
    });
}

// Start auto refresh
function startAutoRefresh() {
    const refreshInterval = 30000; // 30 seconds
    
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            refreshPageData();
        }
    }, refreshInterval);
}

// Refresh page data
function refreshPageData() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'home':
            refreshHomeData();
            break;
        case 'missions':
            refreshMissionsData();
            break;
        case 'drivers':
            refreshDriversData();
            break;
    }
}

// Save application state
function saveAppState() {
    if (currentBookingId) {
        localStorage.setItem('currentBookingId', currentBookingId);
    }
}

// Handle window focus
function handleWindowFocus() {
    refreshPageData();
}

// Handle window blur
function handleWindowBlur() {
    // Pause auto-refresh when window is not visible
}

// Page-specific initialization functions
function initializeHomePage() {
    console.log('Initializing home page');
    
    // Auto-refresh dashboard data
    refreshHomeData();
}

function initializeBookingPage() {
    console.log('Initializing booking page');
    
    // Setup fare estimation
    setupFareEstimation();
    
    // Setup phone number formatting
    setupPhoneFormatting();
    
    // Setup location autocomplete (placeholder)
    setupLocationAutocomplete();
}

function initializeMissionsPage() {
    console.log('Initializing missions page');
    
    // Setup mission tracking
    setupMissionTracking();
    
    // Auto-refresh missions
    refreshMissionsData();
}

function initializeDriversPage() {
    console.log('Initializing drivers page');
    
    // Setup driver management
    setupDriverManagement();
    
    // Auto-refresh driver data
    refreshDriversData();
}

// Fare estimation
function setupFareEstimation() {
    const pickupInput = document.getElementById('pickup');
    const destinationInput = document.getElementById('destination');
    const fareDisplay = document.getElementById('fareEstimate');
    
    if (pickupInput && destinationInput && fareDisplay) {
        const updateFare = () => {
            const pickup = pickupInput.value.trim();
            const destination = destinationInput.value.trim();
            
            if (pickup && destination) {
                // Simulate fare calculation
                const baseFare = 5.00;
                const perKmRate = 2.50;
                const estimatedDistance = Math.random() * 20 + 2; // 2-22 km
                const estimatedFare = baseFare + (estimatedDistance * perKmRate);
                
                fareDisplay.innerHTML = `
                    <div class="alert alert-info">
                        <strong>Estimated Fare: $${estimatedFare.toFixed(2)}</strong><br>
                        <small>Distance: ~${estimatedDistance.toFixed(1)} km | Base: $${baseFare} + $${perKmRate}/km</small>
                    </div>
                `;
            } else {
                fareDisplay.innerHTML = '';
            }
        };
        
        pickupInput.addEventListener('input', updateFare);
        destinationInput.addEventListener('input', updateFare);
    }
}

// Phone number formatting
function setupPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            this.value = value;
        });
    }
}

// Location autocomplete (placeholder)
function setupLocationAutocomplete() {
    const locationInputs = document.querySelectorAll('input[data-location="true"]');
    
    locationInputs.forEach(input => {
        input.addEventListener('input', function() {
            // In a real app, this would connect to a geocoding service
            // For now, just add some visual feedback
            this.style.borderColor = this.value.length > 3 ? '#28a745' : '#ced4da';
        });
    });
}

// Mission tracking
function setupMissionTracking() {
    // Setup real-time mission updates (placeholder)
    console.log('Mission tracking initialized');
}

// Driver management
function setupDriverManagement() {
    // Setup driver status updates (placeholder)
    console.log('Driver management initialized');
}

// Data refresh functions
function refreshHomeData() {
    // Refresh dashboard statistics
    updateDashboardStats();
}

function refreshMissionsData() {
    // Refresh mission status
    updateMissionStatuses();
}

function refreshDriversData() {
    // Refresh driver availability
    updateDriverStatuses();
}

// Update dashboard statistics
function updateDashboardStats() {
    const statElements = document.querySelectorAll('[data-stat]');
    
    statElements.forEach(element => {
        const statType = element.getAttribute('data-stat');
        // Simulate real-time updates
        if (statType === 'active-missions') {
            const currentValue = parseInt(element.textContent) || 0;
            const newValue = Math.max(0, currentValue + Math.floor(Math.random() * 3) - 1);
            element.textContent = newValue;
        }
    });
}

// Update mission statuses
function updateMissionStatuses() {
    const missionCards = document.querySelectorAll('.mission-card');
    
    missionCards.forEach(card => {
        const statusBadge = card.querySelector('.badge');
        if (statusBadge && statusBadge.textContent.includes('In Progress')) {
            // Simulate status updates
            if (Math.random() < 0.1) { // 10% chance of status change
                statusBadge.textContent = 'Completed';
                statusBadge.className = 'badge bg-success';
                card.classList.add('completed');
                showNotification('Mission Completed', 'A taxi mission has been completed!', 'success');
            }
        }
    });
}

// Update driver statuses
function updateDriverStatuses() {
    const driverCards = document.querySelectorAll('.driver-card');
    
    driverCards.forEach(card => {
        const statusBadge = card.querySelector('.status-badge');
        if (statusBadge && Math.random() < 0.05) { // 5% chance of status change
            const isAvailable = statusBadge.textContent.includes('Available');
            if (isAvailable) {
                statusBadge.innerHTML = '<i class="bi bi-clock"></i> Busy';
                statusBadge.className = 'badge bg-warning status-badge';
                card.classList.remove('border-success');
                card.classList.add('border-warning');
            } else {
                statusBadge.innerHTML = '<i class="bi bi-check-circle"></i> Available';
                statusBadge.className = 'badge bg-success status-badge';
                card.classList.remove('border-warning');
                card.classList.add('border-success');
            }
        }
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Export functions for global access
window.SmartTaxis = {
    showNotification,
    showToast,
    copyToClipboard,
    formatCurrency,
    formatTime,
    formatDate,
    refreshPageData
};

// Console welcome message
console.log('%c🚕 Smart Taxis MVP', 'color: #007bff; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to Smart Taxis MVP! This is a demonstration application.', 'color: #6c757d;');
console.log('%cFor more information, visit: https://github.com/Yun12-yu/smart_raid', 'color: #6c757d;');