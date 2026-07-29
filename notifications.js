import { state } from './state.js';

// Notification types: 'alert', 'warning', 'success', 'info'
export class NotificationManager {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.createNotificationCenter();
    }

    createNotificationCenter() {
        const center = document.createElement('div');
        center.id = 'notification-center';
        center.className = 'notification-center';
        document.body.appendChild(center);
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
            read: false
        };

        this.notifications.push(notification);
        this.showToast(notification);
        this.notifyListeners();

        if (duration > 0) {
            setTimeout(() => this.dismiss(notification.id), duration);
        }

        return notification.id;
    }

    showToast(notification) {
        const container = document.getElementById('notification-center');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type}`;
        toast.id = `toast-${notification.id}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(notification.type)}</span>
                <p class="toast-message">${notification.message}</p>
                <button class="toast-close" aria-label="Close">✕</button>
            </div>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(notification.id);
        });

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
    }

    dismiss(id) {
        const toast = document.getElementById(`toast-${id}`);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifyListeners();
    }

    getIcon(type) {
        const icons = {
            'alert': '⚠️',
            'warning': '⚡',
            'success': '✅',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.notifications));
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.notifyListeners();
    }

    getAll() {
        return this.notifications;
    }

    clear() {
        this.notifications = [];
        const container = document.getElementById('notification-center');
        if (container) container.innerHTML = '';
        this.notifyListeners();
    }
}

export const notificationManager = new NotificationManager();

// Convenience functions
export function notifySuccess(message) {
    notificationManager.notify(message, 'success', 3000);
}

export function notifyWarning(message) {
    notificationManager.notify(message, 'warning', 5000);
}

export function notifyError(message) {
    notificationManager.notify(message, 'alert', 5000);
}

export function notifyInfo(message) {
    notificationManager.notify(message, 'info', 4000);
}

// Trigger notifications for student events
export function attachNotificationListeners() {
    // Listen for mark updates
    if (state.students) {
        state.students.forEach(student => {
            // Notification when marks are added/updated
            const avgMarks = calculateAverage(student.marks);
            if (avgMarks < 40) {
                notifyWarning(`⚠️ ${student.name}: Average marks below 40% - Intervention needed`);
            } else if (avgMarks >= 80) {
                notifySuccess(`✨ ${student.name}: Excellent performance! Keep it up!`);
            }
        });
    }
}

function calculateAverage(marks) {
    if (!marks) return 0;
    const values = Object.values(marks).map(v => parseFloat(v) || 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
