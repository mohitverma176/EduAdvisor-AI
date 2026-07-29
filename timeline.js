import { state } from './state.js';
import { calculateWeightedAverage } from './weightage.js';

export function initMarksHistory() {
    if (!state.marksHistory) {
        state.marksHistory = {};
    }
    state.students.forEach(student => {
        if (!state.marksHistory[student.name]) {
            state.marksHistory[student.name] = [];
        }
    });
}

export function recordMarksSnapshot(student) {
    initMarksHistory();
    
    if (!state.marksHistory[student.name]) {
        state.marksHistory[student.name] = [];
    }

    const snapshot = {
        date: new Date().toISOString(),
        marks: { ...student.marks },
        average: calculateWeightedAverage(student.marks),
        attendance: student.attendance
    };

    state.marksHistory[student.name].push(snapshot);
    localStorage.setItem('edu_marks_history', JSON.stringify(state.marksHistory));
    return snapshot;
}

export function getStudentTimeline(studentName) {
    initMarksHistory();
    return state.marksHistory[studentName] || [];
}

export function renderTimelinePanel(student) {
    if (!student) return null;

    const panel = document.createElement('div');
    panel.id = 'timeline-panel';
    panel.className = 'panel timeline-panel';

    initMarksHistory();
    const timeline = getStudentTimeline(student.name);

    let timelineHTML = '';
    if (timeline.length > 0) {
        // Sort by date (newest first)
        const sorted = [...timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sorted.forEach((entry, idx) => {
            const date = new Date(entry.date);
            const avg = parseFloat(entry.average).toFixed(1);
            const trend = idx > 0 ? (entry.average - sorted[idx - 1].average) : 0;
            const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';

            timelineHTML += `
                <div class="timeline-entry">
                    <div class="timeline-marker">
                        <div class="marker-dot ${avg >= 80 ? 'marker-green' : avg >= 40 ? 'marker-yellow' : 'marker-red'}"></div>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-date">${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div class="timeline-data">
                            <span class="timeline-avg">Avg: ${avg}%</span>
                            <span class="timeline-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}">${trendIcon} ${Math.abs(trend).toFixed(1)}%</span>
                        </div>
                        <div class="timeline-subjects">
                            ${Object.entries(entry.marks).map(([subject, mark]) => 
                                `<span class="subject-badge">${subject.substring(0, 1).toUpperCase()}: ${mark}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        timelineHTML = '<p style="color: #999; padding: 20px; text-align: center;">No historical data yet. Mark will appear as you update grades.</p>';
    }

    panel.innerHTML = `
        <div class="panel-header">
            <span class="panel-icon">📈</span>
            <h3 class="panel-title">Progress Timeline - ${student.name}</h3>
        </div>

        <div class="timeline-container">
            <div class="timeline-header">
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    Track improvement over time. Each snapshot captures marks and attendance.
                </p>
                <button id="take-snapshot-btn" class="add-btn" style="width: 100%; margin-bottom: 20px;">
                    📸 Take Current Snapshot
                </button>
            </div>
            
            <div class="timeline-list">
                ${timelineHTML}
            </div>
        </div>
    `;

    // Snapshot button
    panel.querySelector('#take-snapshot-btn')?.addEventListener('click', () => {
        recordMarksSnapshot(student);
        // Refresh panel
        const updated = renderTimelinePanel(student);
        panel.replaceWith(updated);
    });

    return panel;
}

export function renderTimelineChart(student) {
    if (!student) return null;

    const container = document.createElement('div');
    container.id = 'timeline-chart-container';
    container.style.cssText = 'width: 100%; height: 300px; margin: 20px 0;';

    initMarksHistory();
    const timeline = getStudentTimeline(student.name);

    if (timeline.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No data to display yet</p>';
        return container;
    }

    // Prepare data for Chart.js
    const sorted = [...timeline].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sorted.map(e => new Date(e.date).toLocaleDateString());
    const avgData = sorted.map(e => parseFloat(e.average));
    const attData = sorted.map(e => e.attendance);

    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">Chart.js not loaded</p>';
        return container;
    }

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Marks (%)',
                    data: avgData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Attendance (%)',
                    data: attData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 20 }
                }
            }
        }
    });

    return container;
}
