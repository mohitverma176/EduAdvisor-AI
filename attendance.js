import { state } from './state.js';

export function initAttendanceHistory() {
    if (!state.attendanceHistory) {
        state.attendanceHistory = {};
    }
    state.students.forEach(student => {
        if (!state.attendanceHistory[student.name]) {
            state.attendanceHistory[student.name] = [];
        }
    });
}

export function recordAttendanceEntry(studentName, presentDays, totalDays) {
    initAttendanceHistory();
    
    if (!state.attendanceHistory[studentName]) {
        state.attendanceHistory[studentName] = [];
    }

    const percentage = totalDays > 0 ? (presentDays / totalDays * 100) : 0;
    const entry = {
        date: new Date().toISOString(),
        presentDays,
        totalDays,
        percentage: Math.round(percentage * 100) / 100
    };

    state.attendanceHistory[studentName].push(entry);
    localStorage.setItem('edu_attendance_history', JSON.stringify(state.attendanceHistory));
    return entry;
}

export function getAttendanceHistory(studentName) {
    initAttendanceHistory();
    return state.attendanceHistory[studentName] || [];
}

export function getAttendanceStats(studentName) {
    const history = getAttendanceHistory(studentName);
    if (history.length === 0) return null;

    const latest = history[history.length - 1];
    const average = history.reduce((sum, entry) => sum + entry.percentage, 0) / history.length;
    const trend = history.length > 1 ? history[history.length - 1].percentage - history[history.length - 2].percentage : 0;

    return {
        current: latest.percentage,
        average: Math.round(average * 100) / 100,
        trend,
        status: latest.percentage >= 75 ? 'Excellent' : latest.percentage >= 60 ? 'Good' : latest.percentage >= 40 ? 'Fair' : 'Poor'
    };
}

export function renderAttendancePanel(student, isTeacher = false) {
    if (!student) return null;

    const panel = document.createElement('div');
    panel.id = 'attendance-panel';
    panel.className = 'panel attendance-panel';

    initAttendanceHistory();
    const history = getAttendanceHistory(student.name);
    const stats = getAttendanceStats(student.name);

    let historyHTML = '';
    if (history.length > 0) {
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sorted.forEach((entry) => {
            const date = new Date(entry.date);
            const statusColor = entry.percentage >= 75 ? '#10b981' : entry.percentage >= 60 ? '#f59e0b' : '#ef4444';
            
            historyHTML += `
                <div class="attendance-entry" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(59, 130, 246, 0.05); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid ${statusColor};">
                    <div>
                        <p style="margin: 0; font-size: 13px; color: #666;">${date.toLocaleDateString()}</p>
                        <p style="margin: 0; font-size: 14px; font-weight: 500;">${entry.presentDays}/${entry.totalDays} days present</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${statusColor};">${entry.percentage}%</p>
                    </div>
                </div>
            `;
        });
    } else {
        historyHTML = '<p style="color: #999; padding: 20px; text-align: center;">No attendance records yet</p>';
    }

    const statsBadge = stats ? `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">Current</p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #3b82f6;">${stats.current}%</p>
            </div>
            <div style="background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">Average</p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #10b981;">${stats.average}%</p>
            </div>
        </div>
    ` : '';

    panel.innerHTML = `
        <div class="panel-header">
            <span class="panel-icon">📅</span>
            <h3 class="panel-title">Attendance History - ${student.name}</h3>
        </div>

        <div style="padding: 20px;">
            ${statsBadge}
            
            ${isTeacher ? `
            <h4 style="margin: 0 0 15px 0; font-size: 14px;">Add Attendance Record</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <input type="number" id="att-present-days" placeholder="Days Present" min="0" style="padding: 10px; background: var(--input-bg); border: var(--input-border); border-radius: 8px; color: var(--text-color);">
                <input type="number" id="att-total-days" placeholder="Total Days" min="0" style="padding: 10px; background: var(--input-bg); border: var(--input-border); border-radius: 8px; color: var(--text-color);">
            </div>
            <button id="record-attendance-btn" class="add-btn" style="width: 100%; margin-bottom: 20px;">Record Attendance</button>
            ` : ''}

            <h4 style="margin: 0 0 15px 0; font-size: 14px;">History</h4>
            <div id="attendance-history" style="max-height: 400px; overflow-y: auto;">
                ${historyHTML}
            </div>
        </div>
    `;

    // Record button handler
    if (isTeacher) {
        panel.querySelector('#record-attendance-btn')?.addEventListener('click', () => {
            const presentDays = parseInt(panel.querySelector('#att-present-days').value) || 0;
            const totalDays = parseInt(panel.querySelector('#att-total-days').value) || 1;
            
            if (totalDays <= 0) {
                alert('Total days must be greater than 0');
                return;
            }

            recordAttendanceEntry(student.name, presentDays, totalDays);
            panel.querySelector('#att-present-days').value = '';
            panel.querySelector('#att-total-days').value = '';
            
            // Refresh panel
            const updated = renderAttendancePanel(student, isTeacher);
            panel.replaceWith(updated);
        });
    }

    return panel;
}
