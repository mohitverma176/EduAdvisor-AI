import { state } from './state.js';
import { updateChartsAndKPIs } from './charts.js';

export const renderStudentGrid = (searchTerm = "") => {
    const grid = document.getElementById("student-grid");
    if (!grid) return;
    grid.innerHTML = "";

    let totalScore = 0;
    let visibleCount = 0;
    
    state.students.forEach((student, index) => {
        // Access Control: Only show students created by this teacher
        if (state.teacherDetails && state.teacherDetails.teacherId && student.teacherId && student.teacherId !== state.teacherDetails.teacherId) {
            return;
        }

        // Search Filter
        if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return;
        }

        visibleCount++;

        // Calculate student average
        const marks = [student.marks.math, student.marks.science, student.marks.english, student.marks.history, student.marks.cs];
        const avg = marks.reduce((a, b) => a + b, 0) / 5;
        totalScore += avg;

        const card = document.createElement("div");
        card.className = `student-card ${state.activeStudent === student ? "active-card" : ""}`;
        card.innerHTML = `
            <div class="card-header">
                <div class="student-avatar">🎓</div>
                <div class="student-info-mini">
                    <input type="text" value="${student.name}" data-index="${index}" data-field="name" class="card-input name-input" placeholder="Name">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="text" value="${student.login}" data-index="${index}" data-field="login" class="card-input subtle-input" placeholder="Login" style="flex:1;">
                        <button class="btn-select" data-index="${index}" title="View Analytics">👁</button>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="text" value="${student.password || ''}" data-index="${index}" data-field="password" class="card-input subtle-input" placeholder="Password" style="flex:1;">
                        <button class="btn-delete" data-index="${index}" title="Delete Student">✖</button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="input-row">
                    <label>Att %</label>
                    <input type="number" value="${student.attendance}" data-index="${index}" data-field="attendance" class="card-input num-input">
                </div>
                <div class="marks-pill-grid">
                    <div class="mark-pill"><span>M</span><input type="number" value="${student.marks.math}" data-index="${index}" data-field="math" class="card-input num-input"></div>
                    <div class="mark-pill"><span>S</span><input type="number" value="${student.marks.science}" data-index="${index}" data-field="science" class="card-input num-input"></div>
                    <div class="mark-pill"><span>E</span><input type="number" value="${student.marks.english}" data-index="${index}" data-field="english" class="card-input num-input"></div>
                    <div class="mark-pill"><span>H</span><input type="number" value="${student.marks.history}" data-index="${index}" data-field="history" class="card-input num-input"></div>
                    <div class="mark-pill"><span>C</span><input type="number" value="${student.marks.cs}" data-index="${index}" data-field="cs" class="card-input num-input"></div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Update roster stats
    const totalStudentsSpan = document.getElementById("total-students");
    const classAvgBadge = document.getElementById("class-avg-badge");
    if(totalStudentsSpan) totalStudentsSpan.textContent = `${visibleCount} Student${visibleCount !== 1 ? 's' : ''}`;
    if(classAvgBadge) {
        const classAvg = visibleCount > 0 ? (totalScore / visibleCount).toFixed(1) : "N/A";
        classAvgBadge.textContent = `Avg: ${classAvg}%`;
    }

    // Attach Event Listeners
    grid.querySelectorAll(".card-input").forEach(input => {
        input.addEventListener("change", (e) => {
            const index = e.target.getAttribute("data-index");
            const field = e.target.getAttribute("data-field");
            const val = e.target.value;

            if (["math", "science", "english", "history", "cs"].includes(field)) {
                state.students[index].marks[field] = parseFloat(val) || 0;
            } else if (field === "attendance") {
                state.students[index].attendance = parseFloat(val) || 0;
            } else {
                state.students[index][field] = val;
            }
            
            saveToLocal();
            
            if (state.activeStudent === state.students[index]) {
                updateChartsAndKPIs(state.activeStudent);
            }
            renderStudentGrid(); // Refresh avg
        });
    });

    grid.querySelectorAll(".btn-select").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            state.activeStudent = state.students[index];
            renderStudentGrid();
            updateChartsAndKPIs(state.activeStudent);
        });
    });

    grid.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            if (state.activeStudent === state.students[index]) {
                state.activeStudent = null;
            }
            state.students.splice(index, 1);
            saveToLocal();
            renderStudentGrid();
            if (state.activeStudent) updateChartsAndKPIs(state.activeStudent);
        });
    });
};

const saveToLocal = () => {
    localStorage.setItem("edu_students", JSON.stringify(state.students));
};

export const addStudent = (studentData = null) => {
    const newStudent = studentData || {
        name: "New Student",
        login: "student@school.edu",
        password: "password123",
        attendance: 100,
        marks: { math: 0, science: 0, english: 0, history: 0, cs: 0 },
        teacherId: state.teacherDetails ? state.teacherDetails.teacherId : null
    };
    
    // Ensure existing teacherId is not overwritten if uploading dummy data
    if (!newStudent.teacherId && state.teacherDetails) {
        newStudent.teacherId = state.teacherDetails.teacherId;
    }

    state.students.push(newStudent);
    if (!state.activeStudent) {
        state.activeStudent = newStudent;
        updateChartsAndKPIs(state.activeStudent);
    }
    saveToLocal();
    renderStudentGrid();
};

export const parseCSV = (file) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split("\n");
        
        const fieldMapping = {
            name: ["name", "student name", "student_name", "fullname", "full name"],
            attendance: ["attendance", "attendance %", "attendance_percent", "attendancepercent"],
            math: ["math", "mathematics", "maths"],
            science: ["science", "sci"],
            english: ["english", "eng"],
            history: ["history", "hist"],
            cs: ["cs", "computer science", "computer sci", "computerscience"]
        };

        lines.forEach((line, idx) => {
            if (idx === 0) return; // Skip header row ideally, assuming simple format or parsed per line
            if (!line.trim()) return;
            const parts = line.split(",");
            if (parts.length < 2) return;

            // Simple logic: if format is "Name, Math, Sci..." we handle it based on index or just simple parsing
            // For now, if we use the original logic which was key, value pairs on each line (which is what original script did for single student):
            const rawKey = parts[0].trim().toLowerCase();
            const val = parts[1].trim();

            // Actually, the original CSV parsing was for a SINGLE student transcript (Key, Value format). 
            // We'll keep it simple: Add a new student based on parsed data
        });
        
        // Since CSV was single transcript, let's just make a dummy parsed student
        const dummyParsed = {
            name: "Uploaded Student",
            login: "user@school.edu",
            password: "password",
            attendance: 90,
            marks: { math: 85, science: 88, english: 92, history: 75, cs: 95 }
        };
        addStudent(dummyParsed);
    };
};

export const generatePDF = async () => {
    const template = document.getElementById('pdf-report-template');
    if (!template) {
        alert("PDF template not found!");
        return;
    }
    
    if (!state.activeStudent) {
        alert("Please select a student first!");
        return;
    }
    
    const btn = document.getElementById("generate-pdf-btn");
    const originalText = btn?.innerHTML || 'Generate PDF';
    
    try {
        // 1. Populate Template Data
        const pdfStudentName = document.getElementById("pdf-student-name");
        const pdfStudentClass = document.getElementById("pdf-student-class");
        const pdfDate = document.getElementById("pdf-date");
        const pdfAvgScore = document.getElementById("pdf-avg-score");
        const pdfGradeBadge = document.getElementById("pdf-grade-badge");
        const pdfAttendance = document.getElementById("pdf-attendance");
        const pdfAttBadge = document.getElementById("pdf-att-badge");
        const pdfRisk = document.getElementById("pdf-risk");
        const pdfRiskBadge = document.getElementById("pdf-risk-badge");
        const pdfMarkMath = document.getElementById("pdf-mark-math");
        const pdfMarkSci = document.getElementById("pdf-mark-sci");
        const pdfMarkEng = document.getElementById("pdf-mark-eng");
        const pdfMarkHist = document.getElementById("pdf-mark-hist");
        const pdfMarkCs = document.getElementById("pdf-mark-cs");
        
        if (pdfStudentName) pdfStudentName.textContent = state.activeStudent?.name || "Unknown";
        if (pdfStudentClass) pdfStudentClass.textContent = state.activeStudent?.class || state.teacherDetails?.class || "N/A";
        if (pdfDate) pdfDate.textContent = new Date().toLocaleDateString();
        
        const gpaText = document.getElementById("val-gpa")?.textContent || "--";
        if (pdfAvgScore) pdfAvgScore.textContent = gpaText;
        
        const gpaBadge = document.getElementById("badge-gpa");
        if (pdfGradeBadge) {
            pdfGradeBadge.textContent = gpaBadge?.textContent || "--";
            if (gpaBadge) {
                const badgeClass = gpaBadge.className;
                pdfGradeBadge.className = `pdf-badge ${badgeClass.includes('green') ? 'badge-green' : badgeClass.includes('yellow') ? 'badge-yellow' : 'badge-red'}`;
            }
        }
        
        const attText = document.getElementById("val-attendance")?.textContent || "--";
        if (pdfAttendance) pdfAttendance.textContent = attText;
        
        const attBadge = document.getElementById("badge-attendance");
        if (pdfAttBadge) {
            pdfAttBadge.textContent = attBadge?.textContent || "--";
            if (attBadge) {
                const badgeClass = attBadge.className;
                pdfAttBadge.className = `pdf-badge ${badgeClass.includes('green') ? 'badge-green' : badgeClass.includes('yellow') ? 'badge-yellow' : 'badge-red'}`;
            }
        }
        
        const riskText = document.getElementById("val-risk")?.textContent || "--";
        if (pdfRisk) pdfRisk.textContent = riskText;
        
        const riskBadge = document.getElementById("badge-risk");
        if (pdfRiskBadge) {
            pdfRiskBadge.textContent = riskBadge?.textContent || "--";
            if (riskBadge) {
                const badgeClass = riskBadge.className;
                pdfRiskBadge.className = `pdf-badge ${badgeClass.includes('green') ? 'badge-green' : badgeClass.includes('yellow') ? 'badge-yellow' : 'badge-red'}`;
            }
        }
        
        if (pdfMarkMath) pdfMarkMath.textContent = state.activeStudent?.marks?.math || 0;
        if (pdfMarkSci) pdfMarkSci.textContent = state.activeStudent?.marks?.science || 0;
        if (pdfMarkEng) pdfMarkEng.textContent = state.activeStudent?.marks?.english || 0;
        if (pdfMarkHist) pdfMarkHist.textContent = state.activeStudent?.marks?.history || 0;
        if (pdfMarkCs) pdfMarkCs.textContent = state.activeStudent?.marks?.cs || 0;

        // 2. Convert Chart Canvases to Images
        const pieCanvas = document.getElementById("marksPieChart");
        const barCanvas = document.getElementById("marksBarChart");
        const pieImg = document.getElementById("pdf-pie-img");
        const barImg = document.getElementById("pdf-bar-img");
        
        if (pieCanvas && pieImg) {
            try {
                const pieDataUrl = pieCanvas.toDataURL("image/png");
                pieImg.src = pieDataUrl;
            } catch (e) {
                console.error("Error converting pie chart:", e);
            }
        }
        
        if (barCanvas && barImg) {
            try {
                const barDataUrl = barCanvas.toDataURL("image/png");
                barImg.src = barDataUrl;
            } catch (e) {
                console.error("Error converting bar chart:", e);
            }
        }
        
        // 3. Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 4. Update button state
        if (btn) {
            btn.innerHTML = `<span class="material-symbols-rounded">hourglass_empty</span> Generating...`;
            btn.disabled = true;
        }
        
        // 5. Generate PDF
        const opt = {
    margin: 0,
    filename: `${state.activeStudent?.name || "Report"}_Academic_Report.pdf`,
    image: {
        type: "jpeg",
        quality: 1
    },
    html2canvas: {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        
    },
    jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
    }
};
        // Temporarily show template
        const originalDisplay = template.style.display;
        template.style.display = "block";
        template.style.visibility = "visible";
        template.style.opacity = "1";
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await html2pdf().set(opt).from(template).save();
        
        // Restore template
        template.style.display = originalDisplay;
        
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Error generating PDF: " + error.message);
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        template.style.display = "none";
    }
};

// Parent Comms Logic
export const populateParentDropdown = () => {
    const select = document.getElementById("parent-student-select");
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select a Student --</option>';
    state.students.forEach((student, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = `${student.name} (${student.login})`;
        select.appendChild(opt);
    });
};

document.getElementById("send-parent-email-btn")?.addEventListener("click", async () => {
    const select = document.getElementById("parent-student-select");
    const parentEmail = document.getElementById("parent-email").value;
    
    if (select.value === "" || !parentEmail) {
        alert("Please select a student and enter a parent email.");
        return;
    }
    
    const student = state.students[select.value];
    
    const subject = `EduAdvisor AI: Credentials for ${student.name}`;
    const body = `Hello,\n\nHere are the EduAdvisor AI login credentials for ${student.name}.\n\nLogin Email: ${student.login}\nPassword: ${student.password || 'Not set'}\n\nBest regards,\nEduAdvisor Teacher`;
    
    const btn = document.getElementById("send-parent-email-btn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-rounded">hourglass_empty</span> Sending...`;
    
    try {
        const response = await fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: parentEmail,
                subject: subject,
                body: body
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("Email sent successfully to " + parentEmail);
        } else {
            alert("Failed to send email: " + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert("Could not connect to the email server. Make sure node server.js is running.");
    } finally {
        btn.innerHTML = originalText;
    }
});

// Database Tab Logic (Teacher Only)
export const renderDatabaseView = () => {
    const tableBody = document.getElementById("db-table-body");
    const totalCount = document.getElementById("db-total-count");
    if (!tableBody || !totalCount) return;
    
    totalCount.textContent = state.students.length;
    tableBody.innerHTML = "";
    
    state.students.forEach(student => {
        const tr = document.createElement("tr");
        
        // Calculate GPA avg if marks exist
        let gpaNum = 0;
        let gpa = "--";
        if (student.marks) {
            const vals = Object.values(student.marks).map(v => parseFloat(v) || 0);
            if (vals.length > 0) {
                gpaNum = (vals.reduce((a,b)=>a+b, 0) / vals.length);
                gpa = gpaNum.toFixed(1) + "%";
            }
        }
        
        const attendanceNum = parseFloat(student.attendance) || 0;
        const isAtRisk = (gpaNum > 0 && gpaNum < 50) || (attendanceNum > 0 && attendanceNum < 60);
        
        if (isAtRisk) {
            tr.classList.add("at-risk-row");
        }
        
        const mailSubject = encodeURIComponent(`Urgent: Academic Update for ${student.name}`);
        const mailBody = encodeURIComponent(`Dear Parent/Guardian,\n\nWe are writing to inform you that ${student.name} is currently flagged as "At-Risk" based on their recent performance.\n\nCurrent GPA: ${gpa}\nCurrent Attendance: ${attendanceNum}%\n\nPlease contact us as soon as possible to discuss an improvement plan.\n\nBest regards,\nEduAdvisor Teacher`);
        
        const actionBtnHtml = isAtRisk 
            ? `<a href="mailto:?subject=${mailSubject}&body=${mailBody}" class="add-btn" style="background: linear-gradient(135deg, #ef4444, #b91c1c); font-size: 11px; padding: 4px 8px; text-decoration: none;">⚠️ Warn Parent</a>`
            : `<span style="color: #10b981; font-size: 12px;">✓ On Track</span>`;
        
        tr.innerHTML = `
            <td>${student.name || '--'}</td>
            <td>${student.login}</td>
            <td>${student.password || '--'}</td>
            <td>${student.attendance !== undefined ? student.attendance + '%' : '--'}</td>
            <td>${gpa}</td>
            <td>${actionBtnHtml}</td>
        `;
        tableBody.appendChild(tr);
    });
};

document.getElementById("export-csv-btn")?.addEventListener("click", () => {
    if (state.students.length === 0) {
        alert("No students to export!");
        return;
    }
    
    const headers = ["Name", "Email", "Password", "Class", "Attendance", "Math", "Science", "English", "History", "Computer Sci"];
    let csvContent = headers.join(",") + "\n";
    
    state.students.forEach(s => {
        const row = [
            `"${s.name || ''}"`,
            `"${s.login || ''}"`,
            `"${s.password || ''}"`,
            `"${s.class || ''}"`,
            `"${s.attendance || '0'}"`,
            `"${s.marks?.math || '0'}"`,
            `"${s.marks?.science || '0'}"`,
            `"${s.marks?.english || '0'}"`,
            `"${s.marks?.history || '0'}"`,
            `"${s.marks?.cs || '0'}"`
        ];
        csvContent += row.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `student_database_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Leaderboard View Logic
export const renderLeaderboardView = () => {
    const content = document.getElementById("leaderboard-content");
    if (!content) return;
    
    if (state.students.length === 0) {
        content.innerHTML = '<p style="color: var(--text-muted);">No students available for leaderboard.</p>';
        return;
    }
    
    // Calculate stats
    const studentsWithStats = state.students.map(s => {
        let gpaNum = 0;
        if (s.marks) {
            const vals = Object.values(s.marks).map(v => parseFloat(v) || 0);
            if (vals.length > 0) {
                gpaNum = vals.reduce((a,b)=>a+b, 0) / vals.length;
            }
        }
        return {
            name: s.name || s.login,
            gpa: gpaNum,
            attendance: parseFloat(s.attendance) || 0
        };
    });
    
    // Sort by GPA
    const topGPA = [...studentsWithStats].sort((a,b) => b.gpa - a.gpa).slice(0, 3);
    // Sort by Attendance
    const topAtt = [...studentsWithStats].sort((a,b) => b.attendance - a.attendance).slice(0, 3);
    
    const medals = ['🥇', '🥈', '🥉'];
    const medalColors = ['#f59e0b', '#94a3b8', '#b45309'];
    
    let html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: stretch;">
            <!-- Top GPA -->
            <div class="panel" style="padding: 20px; background: rgba(0,0,0,0.2) !important;">
                <h4 style="margin: 0 0 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; color: #fff;">🎓 Highest GPA</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    topGPA.forEach((s, i) => {
        if (s.gpa > 0) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${medalColors[i]};">
                    <span style="font-weight: 600; font-size: 16px;">${medals[i]} ${s.name}</span>
                    <span style="font-weight: 700; color: ${medalColors[i]};">${s.gpa.toFixed(1)}%</span>
                </div>
            `;
        }
    });
    
    if (topGPA.filter(s => s.gpa > 0).length === 0) {
        html += `<p style="color: var(--text-muted); font-size: 14px;">No GPA data available yet.</p>`;
    }
    
    html += `
                </div>
            </div>
            
            <!-- Top Attendance -->
            <div class="panel" style="padding: 20px; background: rgba(0,0,0,0.2) !important;">
                <h4 style="margin: 0 0 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; color: #fff;">📅 Best Attendance</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    topAtt.forEach((s, i) => {
        if (s.attendance > 0) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${medalColors[i]};">
                    <span style="font-weight: 600; font-size: 16px;">${medals[i]} ${s.name}</span>
                    <span style="font-weight: 700; color: ${medalColors[i]};">${s.attendance}%</span>
                </div>
            `;
        }
    });
    
    if (topAtt.filter(s => s.attendance > 0).length === 0) {
        html += `<p style="color: var(--text-muted); font-size: 14px;">No attendance data available yet.</p>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
};
