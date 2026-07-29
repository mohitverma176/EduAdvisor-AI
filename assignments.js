import { state } from './state.js';
import { notifySuccess, notifyInfo, notifyWarning } from './notifications.js';

export function initAssignments() {
    if (!state.assignments) {
        state.assignments = [];
    }
}

export function createAssignment(title, description, dueDate, subject, studentIds = []) {
    initAssignments();
    let targetStudentIds = studentIds;
    if (targetStudentIds.length === 0) {
        targetStudentIds = [];
        state.students.forEach((student, index) => {
            // Include if student has no teacherId OR matches current teacher
            if (!student.teacherId || (state.teacherDetails && student.teacherId === state.teacherDetails.teacherId)) {
                targetStudentIds.push(index);
            }
        });
    }

    const assignment = {
        id: Date.now(),
        title,
        description,
        dueDate,
        subject,
        createdAt: new Date(),
        studentIds: targetStudentIds,
        submissions: {},
        teacherId: state.teacherDetails ? state.teacherDetails.teacherId : null
    };

    state.assignments.push(assignment);
    saveAssignments();
    notifySuccess(`Assignment "${title}" created successfully`);
    alert(`Assignment is created`);
    return assignment;
}

export function deleteAssignment(assignmentId) {
    initAssignments();
    state.assignments = state.assignments.filter(a => a.id !== assignmentId);
    saveAssignments();
    notifySuccess('Assignment deleted');
}

export function submitAssignment(assignmentId, studentId) {
    initAssignments();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    const student = state.students[studentId];
    if (!assignment.submissions) assignment.submissions = {};

    assignment.submissions[studentId] = {
        submittedAt: new Date(),
        status: 'submitted'
    };

    saveAssignments();
    notifySuccess(`${student.name} submitted the assignment`);
    return true;
}

export function markAssignmentComplete(assignmentId, studentId) {
    initAssignments();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    if (!assignment.submissions) assignment.submissions = {};
    assignment.submissions[studentId] = {
        submittedAt: new Date(),
        status: 'completed'
    };

    saveAssignments();
    notifySuccess('Assignment marked as complete');
    return true;
}

export function markAssignmentSeen(assignmentId, studentId) {
    initAssignments();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    if (!assignment.submissions) assignment.submissions = {};
    if (!assignment.submissions[studentId] || assignment.submissions[studentId].status === 'unseen') {
        assignment.submissions[studentId] = {
            status: 'seen',
            seenAt: new Date()
        };
        saveAssignments();
    }
    return true;
}

export function getStudentAssignments(studentId) {
    initAssignments();
    return state.assignments.filter(a => a.studentIds.includes(studentId));
}

export function getAssignmentStats(assignmentId) {
    initAssignments();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;

    const total = assignment.studentIds.length;
    const submitted = Object.values(assignment.submissions).filter(sub => sub.status === 'completed' || sub.status === 'submitted').length;
    const pending = total - submitted;
    const completionRate = total > 0 ? (submitted / total * 100).toFixed(1) : 0;

    return {
        total,
        submitted,
        pending,
        completionRate,
        daysUntilDue: Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    };
}

export function saveAssignments() {
    localStorage.setItem('edu_assignments', JSON.stringify(state.assignments));
}

export function loadAssignments() {
    const saved = localStorage.getItem('edu_assignments');
    if (saved) {
        state.assignments = JSON.parse(saved);
    } else {
        initAssignments();
    }
}

export function renderAssignmentPanel(isTeacher = false) {
    const panel = document.createElement('div');
    panel.id = 'assignment-panel';
    panel.className = 'panel assignment-panel';

    initAssignments();

    if (isTeacher) {
        panel.innerHTML = `
            <div class="panel-header">
                <span class="panel-icon">📝</span>
                <h3 class="panel-title">Assignment Manager</h3>
            </div>
            <div class="assignment-form-container">
                <h4>Create New Assignment</h4>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="assignment-title" placeholder="e.g. Math Chapter 5 Problems">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="assignment-desc" placeholder="Assignment details..." style="min-height: 80px;"></textarea>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <select id="assignment-subject">
                        <option value="math">Mathematics</option>
                        <option value="science">Science</option>
                        <option value="english">English</option>
                        <option value="history">History</option>
                        <option value="cs">Computer Science</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Assign To</label>
                    <select id="assignment-target-student">
                        <option value="all">Entire Class</option>
                        ${state.students
                            .map((student, idx) => ({ student, idx }))
                            .filter(({ student }) => state.teacherDetails && student.teacherId === state.teacherDetails.teacherId)
                            .map(({ student, idx }) => `<option value="${idx}">${student.name}</option>`)
                            .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="assignment-due-date">
                </div>
                <button id="create-assignment-btn" class="add-btn">Create Assignment</button>
            </div>
            <div class="assignments-list">
                <h4 style="margin-top: 30px;">Active Assignments</h4>
                <div id="teacher-assignments-list" style="margin-top: 15px;"></div>
            </div>
        `;

        // Create assignment handler
        panel.querySelector('#create-assignment-btn')?.addEventListener('click', () => {
            const title = panel.querySelector('#assignment-title')?.value;
            const desc = panel.querySelector('#assignment-desc')?.value;
            const dueDate = panel.querySelector('#assignment-due-date')?.value;
            const subject = panel.querySelector('#assignment-subject')?.value;
            const targetStudent = panel.querySelector('#assignment-target-student')?.value;

            if (!title || !dueDate) {
                notifyWarning('Please fill in title and due date');
                return;
            }

            const studentIds = (targetStudent && targetStudent !== 'all') ? [parseInt(targetStudent)] : [];
            createAssignment(title, desc, dueDate, subject, studentIds);
            
            panel.querySelector('#assignment-title').value = '';
            panel.querySelector('#assignment-desc').value = '';
            panel.querySelector('#assignment-due-date').value = '';
            panel.querySelector('#assignment-target-student').value = 'all';
            renderAssignmentsList(true);
        });

    } else {
        // Student view
        panel.innerHTML = `
            <div class="panel-header">
                <span class="panel-icon">📚</span>
                <h3 class="panel-title">My Assignments</h3>
            </div>
            <div id="student-assignments-list" style="padding: 15px;"></div>
        `;
    }

    renderAssignmentsList();
    return panel;
}

export function renderAssignmentsList(isTeacherParam) {
    const container = document.getElementById('teacher-assignments-list') || 
                     document.getElementById('student-assignments-list');
    if (!container) return;

    container.innerHTML = '';
    initAssignments();

    // robustly determine isTeacher
    const isTeacher = isTeacherParam !== undefined ? isTeacherParam : (document.getElementById('teacher-assignments-list') !== null);
    const studentIndex = isTeacher ? -1 : state.students.findIndex(s => s.login === state.activeStudent?.login);

    const visibleAssignments = state.assignments.filter(a => {
        if (isTeacher) {
            // Show all assignments if teacherId isn't properly scoped, or match teacherId
            return !a.teacherId || (state.teacherDetails && a.teacherId === state.teacherDetails.teacherId) || true; // Fallback to show all for demo
        } else if (state.activeStudent) {
            // Find correct student index by login
            const sIdx = state.students.findIndex(s => s.login === state.activeStudent.login);
            return a.studentIds.includes(sIdx);
        }
        return false;
    });

    if (isTeacher) {
        // Render a dedicated Assignment Status Overview Table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'assignment-table-container';
        tableContainer.style.marginBottom = '30px';
        
        if (visibleAssignments.length === 0) {
            tableContainer.innerHTML = '<p style="color: #999;">No assignments yet. Create one above to see the Status Overview.</p>';
            container.appendChild(tableContainer);
            return;
        }

        let ths = `<th>Student Name</th>`;
        visibleAssignments.forEach(a => {
            ths += `<th>${a.title}</th>`;
        });
        
        let trs = '';
        state.students.forEach((s, idx) => {
            // Show student if they have no teacherId OR match current teacher
            if (s.teacherId && state.teacherDetails && s.teacherId !== state.teacherDetails.teacherId) return;
            let row = `<tr><td style="font-weight: 600;">${s.name}</td>`;
            visibleAssignments.forEach(a => {
                if(a.studentIds.includes(idx)) {
                    const sub = a.submissions[idx];
                    const status = sub ? sub.status : 'pending';
                    const color = status === 'completed' ? '#10b981' : (status === 'seen' ? '#3b82f6' : '#f59e0b');
                    row += `<td style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</td>`;
                } else {
                    row += `<td style="color: #64748b;">N/A</td>`;
                }
            });
            row += `</tr>`;
            trs += row;
        });

        tableContainer.innerHTML = `
            <h4 style="margin-bottom: 15px;">Assignment Status Overview (Table)</h4>
            <table class="db-table" style="min-width: 600px;">
                <thead><tr>${ths}</tr></thead>
                <tbody>${trs}</tbody>
            </table>
        `;
        container.appendChild(tableContainer);
    } else {
        if (visibleAssignments.length === 0) {
            container.innerHTML = '<p style="color: #999;">No assignments yet</p>';
            return;
        }
    }


    visibleAssignments.forEach(assignment => {
        // Remove automatic seen logic to require manual open
        const studentSub = (!isTeacher && studentIndex !== -1) ? assignment.submissions[studentIndex] : null;
        const studentStatus = studentSub ? studentSub.status : 'pending';

        const stats = getAssignmentStats(assignment.id);
        const card = document.createElement('div');
        card.className = 'assignment-card';
        
        let teacherStatusHtml = '';
        if (isTeacher) {
            teacherStatusHtml = `
                <div class="assignment-student-status" style="margin-top: 15px; background: var(--input-bg); padding: 10px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h5 style="margin: 0;">Student Status</h5>
                    </div>
                    <ul style="list-style:none; padding:0; margin:0; font-size: 13px;">
                        ${assignment.studentIds.map(idx => {
                            const s = state.students[idx];
                            if(!s) return '';
                            const sub = assignment.submissions[idx];
                            const status = sub ? sub.status : 'pending';
                            const color = status === 'completed' ? '#10b981' : (status === 'seen' ? '#3b82f6' : '#f59e0b');
                            
                            const statusOptions = ['pending', 'seen', 'completed'];
                            const dropdownHtml = `
                                <select class="status-dropdown" data-id="${assignment.id}" data-student="${idx}" style="font-size: 11px; padding: 2px; border-radius: 4px; background: var(--panel-bg); color: var(--text-color); border: 1px solid var(--border-color);">
                                    ${statusOptions.map(opt => `<option value="${opt}" ${status === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
                                </select>
                            `;
                            
                            return `<li style="display:flex; justify-content:space-between; margin-bottom:6px; align-items: center;">
                                <span>${s.name}</span>
                                <span style="display: flex; align-items: center; gap: 10px;">
                                    <span style="color: ${color}; font-weight:600;">${status.toUpperCase()}</span>
                                    ${dropdownHtml}
                                </span>
                            </li>`;
                        }).join('')}
                    </ul>
                </div>
                <button class="assignment-delete-btn add-btn" data-id="${assignment.id}" style="margin-top: 10px; background: #ef4444; width: 100%;">Delete Assignment</button>
            `;
        }

        let studentActionHtml = '';
        let isHiddenDescription = false;
        if (!isTeacher && studentIndex !== -1) {
            if (studentStatus === 'completed') {
                studentActionHtml = `<div style="margin-top:15px;"><span style="color: #10b981; font-weight:bold;">✅ Completed</span></div>`;
            } else if (studentStatus === 'seen') {
                studentActionHtml = `<div style="margin-top:15px;"><button class="assignment-complete-btn add-btn" data-id="${assignment.id}" data-student="${studentIndex}" style="width: 100%;">Mark as Completed</button></div>`;
            } else {
                isHiddenDescription = true;
                studentActionHtml = `<div style="margin-top:15px;"><button class="assignment-open-btn add-btn" data-id="${assignment.id}" data-student="${studentIndex}" style="width: 100%; background: #3b82f6;">Open/View</button></div>`;
            }
        }

        card.innerHTML = `
            <div class="assignment-card-header">
                <h4>${assignment.title}</h4>
                <span class="assignment-subject-tag">${assignment.subject.toUpperCase()}</span>
            </div>
            ${isHiddenDescription ? `<p class="assignment-desc" style="filter: blur(4px); user-select: none;">Content hidden until opened.</p>` : `<p class="assignment-desc">${assignment.description}</p>`}
            <div class="assignment-meta">
                <span>Due: ${new Date(assignment.dueDate).toLocaleDateString()}</span>
                <span>${stats.daysUntilDue > 0 ? stats.daysUntilDue + ' days left' : 'OVERDUE'}</span>
            </div>
            <div class="assignment-stats">
                <span>Completed: ${stats.submitted}/${stats.total}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${stats.completionRate}%"></div>
                </div>
            </div>
            ${teacherStatusHtml}
            ${studentActionHtml}
        `;

        container.appendChild(card);
    });

    // Attach delete handlers for teachers
    container.querySelectorAll('.assignment-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteAssignment(parseInt(id));
            renderAssignmentsList(true);
        });
    });

    // Attach status dropdown handler for teachers
    container.querySelectorAll('.status-dropdown').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const studentIdx = parseInt(e.target.getAttribute('data-student'));
            const newStatus = e.target.value;
            
            initAssignments();
            const assignment = state.assignments.find(a => a.id === id);
            if (assignment) {
                if (!assignment.submissions) assignment.submissions = {};
                assignment.submissions[studentIdx] = {
                    status: newStatus,
                    updatedAt: new Date()
                };
                saveAssignments();
                renderAssignmentsList(true);
            }
        });
    });

    // Attach complete handlers for students
    container.querySelectorAll('.assignment-complete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const studentIdx = e.target.getAttribute('data-student');
            markAssignmentComplete(parseInt(id), parseInt(studentIdx));
            renderAssignmentsList(false);
        });
    });

    // Attach open handlers for students
    container.querySelectorAll('.assignment-open-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const studentIdx = e.target.getAttribute('data-student');
            markAssignmentSeen(parseInt(id), parseInt(studentIdx));
            renderAssignmentsList(false);
        });
    });
}
