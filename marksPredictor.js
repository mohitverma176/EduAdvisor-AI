import { state } from './state.js';
import { calculateWeightedAverage } from './weightage.js';

const PASS_THRESHOLD = 40;
const TOP_THRESHOLD = 80;

export function calculateMarksNeeded(student, targetPercentage = PASS_THRESHOLD) {
    if (!student || !student.marks) return null;

    const weights = state.subjectWeights || {
        math: 20, science: 20, english: 20, history: 20, cs: 20
    };

    const currentAvg = calculateWeightedAverage(student.marks);
    const currentTotal = currentAvg;

    // Calculate how much total improvement needed
    const improvementNeeded = Math.max(0, targetPercentage - currentAvg);

    // Distribute improvement across all subjects
    const marksNeeded = {};
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    for (const subject in student.marks) {
        const currentMark = parseFloat(student.marks[subject]) || 0;
        const subjectWeight = weights[subject] || 0;
        
        // How much this subject needs to improve
        const subjectImprovementNeeded = improvementNeeded * (subjectWeight / totalWeight);
        const newMark = Math.min(100, currentMark + subjectImprovementNeeded);
        
        marksNeeded[subject] = {
            current: currentMark,
            needed: Math.max(currentMark, newMark),
            improvement: Math.max(0, newMark - currentMark)
        };
    }

    return {
        currentAverage: parseFloat(currentAvg.toFixed(2)),
        targetPercentage,
        marksNeeded,
        wouldPass: currentAvg >= PASS_THRESHOLD,
        wouldTop: currentAvg >= TOP_THRESHOLD,
        improvementRequired: Math.max(0, improvementNeeded)
    };
}

export function calculateWhatIfScenario(student, hypotheticalMarks) {
    if (!student) return null;

    // Create a copy with updated marks
    const modifiedMarks = { ...student.marks, ...hypotheticalMarks };
    const newAverage = calculateWeightedAverage(modifiedMarks);

    return {
        originalAverage: parseFloat(calculateWeightedAverage(student.marks).toFixed(2)),
        newAverage: parseFloat(newAverage.toFixed(2)),
        change: parseFloat((newAverage - calculateWeightedAverage(student.marks)).toFixed(2)),
        wouldPass: newAverage >= PASS_THRESHOLD,
        wouldTop: newAverage >= TOP_THRESHOLD
    };
}

export function renderMarksPredictorPanel(student, isTeacher = false) {
    if (!student) return null;

    const panel = document.createElement('div');
    panel.id = 'marks-predictor-panel';
    panel.className = 'panel marks-predictor-panel';

    const markData = calculateMarksNeeded(student, PASS_THRESHOLD);
    const topData = calculateMarksNeeded(student, TOP_THRESHOLD);

    let subjectsHTML = '';
    for (const subject in markData.marksNeeded) {
        const data = markData.marksNeeded[subject];
        const progressPercent = (data.current / 100) * 100;
        subjectsHTML += `
            <div class="marks-row">
                <div class="subject-name">${subject.charAt(0).toUpperCase() + subject.slice(1)}</div>
                <div class="marks-data">
                    <span class="current-mark">${data.current}</span>
                    <span class="arrow">→</span>
                    <span class="needed-mark">${data.needed.toFixed(1)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;
    }

    panel.innerHTML = `
        <div class="panel-header">
            <span class="panel-icon">🎯</span>
            <h3 class="panel-title">Mark Predictor - ${student.name}</h3>
        </div>

        <div class="predictor-content">
            <div class="predictor-section">
                <h4>Current Performance</h4>
                <div class="current-stats">
                    <div class="stat-item">
                        <span class="stat-label">Average Score</span>
                        <span class="stat-value">${markData.currentAverage.toFixed(1)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Status</span>
                        <span class="stat-badge ${markData.wouldPass ? 'badge-green' : 'badge-red'}">
                            ${markData.wouldPass ? 'PASS ✓' : 'AT RISK ⚠️'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="predictor-section">
                <h4>To Pass (40%)</h4>
                <div class="marks-needed-box">
                    <p>Current: <strong>${markData.currentAverage}%</strong> | Target: <strong>40%</strong></p>
                    ${markData.currentAverage >= 40 ? 
                        '<p style="color: #10b981; margin-top: 10px;">✓ Already passing!</p>' :
                        `<p style="color: #ef4444; margin-top: 10px;">Need ${(40 - markData.currentAverage).toFixed(1)} more marks</p>`
                    }
                </div>
            </div>

            <div class="predictor-section">
                <h4>To Top (80%)</h4>
                <div class="marks-needed-box">
                    <p>Current: <strong>${markData.currentAverage}%</strong> | Target: <strong>80%</strong></p>
                    ${markData.currentAverage >= 80 ? 
                        '<p style="color: #10b981; margin-top: 10px;">✓ Already topping!</p>' :
                        `<p style="color: #f59e0b; margin-top: 10px;">Need ${(80 - markData.currentAverage).toFixed(1)} more marks</p>`
                    }
                </div>
            </div>
            
            ${!isTeacher ? `
            <div class="predictor-section">
                <h4>Subject-wise Marks Analysis</h4>
                <div class="marks-analysis">
                    ${subjectsHTML}
                </div>
            </div>

            <div class="predictor-section what-if">
                <h4>What-If Scenario Calculator</h4>
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Adjust marks to see how it affects your average</p>
                <div id="what-if-inputs" class="what-if-inputs"></div>
                <button id="calculate-what-if" class="add-btn" style="margin-top: 15px;">Calculate Scenario</button>
                <div id="what-if-result" style="margin-top: 15px; display: none;"></div>
            </div>
            ` : ''}
        </div>
    `;

    if (!isTeacher) {
        // Build what-if inputs
        const whatIfContainer = panel.querySelector('#what-if-inputs');
    for (const subject in student.marks) {
        const label = subject.charAt(0).toUpperCase() + subject.slice(1);
        const current = parseFloat(student.marks[subject]) || 0;
        whatIfContainer.innerHTML += `
            <div class="what-if-input-group">
                <label>${label}</label>
                <input type="number" class="what-if-input" data-subject="${subject}" value="${current}" min="0" max="100">
            </div>
        `;
    }

    // Calculate button handler
    const calcBtn = panel.querySelector('#calculate-what-if');
    calcBtn?.addEventListener('click', () => {
        const hypothetical = {};
        panel.querySelectorAll('.what-if-input').forEach(input => {
            hypothetical[input.getAttribute('data-subject')] = parseFloat(input.value) || 0;
        });

        const result = calculateWhatIfScenario(student, hypothetical);
        const resultDiv = panel.querySelector('#what-if-result');
        
        resultDiv.innerHTML = `
            <div class="what-if-result-box">
                <p>Original Average: <strong>${result.originalAverage}%</strong></p>
                <p>New Average: <strong style="color: #3b82f6;">${result.newAverage}%</strong></p>
                <p>Change: <strong style="color: ${result.change >= 0 ? '#10b981' : '#ef4444'};">
                    ${result.change >= 0 ? '+' : ''}${result.change.toFixed(2)}%
                </strong></p>
                <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                    Status: <span class="stat-badge ${result.wouldPass ? 'badge-green' : 'badge-red'}">
                        ${result.wouldPass ? 'PASS ✓' : 'AT RISK ⚠️'}
                    </span>
                </p>
            </div>
        `;
        resultDiv.style.display = 'block';
    });
    }

    return panel;
}
