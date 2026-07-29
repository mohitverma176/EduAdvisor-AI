import { state } from './state.js';

export function renderAssignmentHistory() {
    const container = document.getElementById('assignment-history-content');
    if (!container) return;

    // Filter assignments that belong to the current teacher
    const teacherId = state.teacherDetails?.teacherId;
    if (!teacherId) {
        container.innerHTML = '<p style="color: #999;">Please log in as a teacher to view assignment history.</p>';
        return;
    }

    const teacherAssignments = state.assignments.filter(a => !a.teacherId || a.teacherId === teacherId);

    if (teacherAssignments.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; margin-top: 20px;">No assignment history available. Create assignments to see analytics.</p>';
        return;
    }

    let html = `
        <div class="db-table-container">
            <table class="db-table" style="min-width: 800px;">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Date Created</th>
                        <th>Due Date</th>
                        <th>Target Audience</th>
                        <th>Completion Progress</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Sort assignments by created date (newest first)
    const sortedAssignments = [...teacherAssignments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedAssignments.forEach(assignment => {
        const totalAssigned = assignment.studentIds.length;
        let completedCount = 0;

        assignment.studentIds.forEach(studentIdx => {
            if (assignment.submissions && assignment.submissions[studentIdx] && assignment.submissions[studentIdx].status === 'completed') {
                completedCount++;
            }
        });

        const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;
        
        let targetLabel = totalAssigned === state.students.filter(s => !s.teacherId || s.teacherId === teacherId).length 
                            ? 'Entire Class' : `${totalAssigned} Student(s)`;

        html += `
            <tr>
                <td style="font-weight: 600;">${assignment.title}</td>
                <td><span class="assignment-subject-tag">${assignment.subject}</span></td>
                <td>${new Date(assignment.createdAt).toLocaleDateString()}</td>
                <td>${new Date(assignment.dueDate).toLocaleDateString()}</td>
                <td>${targetLabel}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 0.85rem; font-weight: 600; min-width: 45px;">${completedCount}/${totalAssigned}</span>
                        <div class="progress-bar" style="margin-top: 0; width: 100px;">
                            <div class="progress-fill" style="width: ${completionRate}%"></div>
                        </div>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${completionRate}%</span>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}
