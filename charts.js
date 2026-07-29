let pieChart = null;
let barChart = null;

export const initCharts = () => {
    const pieCanvas = document.getElementById('marksPieChart');
    const barCanvas = document.getElementById('marksBarChart');
    if (!pieCanvas || !barCanvas) return;

    const pieCtx = pieCanvas.getContext('2d');
    const barCtx = barCanvas.getContext('2d');

    const labels = ['Mathematics', 'Science', 'English', 'History', 'Computer Sci'];
    const initialMarks = [0, 0, 0, 0, 0];

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: initialMarks,
                backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 2,
                borderColor: document.body.classList.contains("light-theme") ? "#ffffff" : "#090d16"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains("light-theme") ? "#0f172a" : "#f1f5f9",
                        boxWidth: 10,
                        padding: 10,
                        font: { size: 10, weight: 600 }
                    }
                }
            }
        }
    });

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: initialMarks,
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderColor: '#3b82f6',
                borderWidth: 1.5,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: document.body.classList.contains("light-theme") ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: document.body.classList.contains("light-theme") ? "#475569" : "#94a3b8",
                        font: { size: 9 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: document.body.classList.contains("light-theme") ? "#475569" : "#94a3b8",
                        font: { size: 9, weight: 500 }
                    }
                }
            }
        }
    });
};

export const updateChartsAndKPIs = (student) => {
    if (!student) return;

    const math = parseFloat(student.marks?.math) || 0;
    const science = parseFloat(student.marks?.science) || 0;
    const english = parseFloat(student.marks?.english) || 0;
    const history = parseFloat(student.marks?.history) || 0;
    const cs = parseFloat(student.marks?.cs) || 0;
    const studentAttendance = parseFloat(student.attendance) || 0;

    const marksArray = [math, science, english, history, cs];
    const avgScore = marksArray.reduce((acc, curr) => acc + curr, 0) / marksArray.length;

    // Update Average KPI Card
    document.getElementById("val-gpa").textContent = `${avgScore.toFixed(1)}%`;
    const gpaBadge = document.getElementById("badge-gpa");
    if (avgScore >= 90) {
        gpaBadge.textContent = "Grade: A";
        gpaBadge.className = "kpi-badge badge-green";
    } else if (avgScore >= 80) {
        gpaBadge.textContent = "Grade: B";
        gpaBadge.className = "kpi-badge badge-green";
    } else if (avgScore >= 70) {
        gpaBadge.textContent = "Grade: C";
        gpaBadge.className = "kpi-badge badge-yellow";
    } else if (avgScore >= 60) {
        gpaBadge.textContent = "Grade: D";
        gpaBadge.className = "kpi-badge badge-yellow";
    } else {
        gpaBadge.textContent = "Grade: F";
        gpaBadge.className = "kpi-badge badge-red";
    }

    // Update Attendance KPI Card
    document.getElementById("val-attendance").textContent = `${studentAttendance.toFixed(1)}%`;
    const attBadge = document.getElementById("badge-attendance");
    if (studentAttendance >= 90) {
        attBadge.textContent = "Excellent";
        attBadge.className = "kpi-badge badge-green";
    } else if (studentAttendance >= 75) {
        attBadge.textContent = "Warning";
        attBadge.className = "kpi-badge badge-yellow";
    } else {
        attBadge.textContent = "Critical";
        attBadge.className = "kpi-badge badge-red";
    }

    // Update Risk Level KPI Card
    const valRisk = document.getElementById("val-risk");
    const riskBadge = document.getElementById("badge-risk");
    
    if (avgScore < 60 || studentAttendance < 75) {
        valRisk.textContent = "High";
        riskBadge.textContent = "Critical";
        riskBadge.className = "kpi-badge badge-red";
    } else if (avgScore < 70 || studentAttendance < 85) {
        valRisk.textContent = "Medium";
        riskBadge.textContent = "Warning";
        riskBadge.className = "kpi-badge badge-yellow";
    } else {
        valRisk.textContent = "Low";
        riskBadge.textContent = "Stable";
        riskBadge.className = "kpi-badge badge-green";
    }

    // Update Chart.js visuals
    if (pieChart && barChart) {
        pieChart.data.datasets[0].data = marksArray;
        barChart.data.datasets[0].data = marksArray;
        pieChart.update();
        barChart.update();
    }
};

export const updateChartTheme = (isLight) => {
    if (pieChart && barChart) {
        const textColor = isLight ? "#0f172a" : "#f1f5f9";
        const textMuted = isLight ? "#475569" : "#94a3b8";
        const borderColor = isLight ? "#ffffff" : "#090d16";
        const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';

        pieChart.options.plugins.legend.labels.color = textColor;
        pieChart.data.datasets[0].borderColor = borderColor;

        barChart.options.scales.y.ticks.color = textMuted;
        barChart.options.scales.y.grid.color = gridColor;
        barChart.options.scales.x.ticks.color = textMuted;

        pieChart.update();
        barChart.update();
    }
};
