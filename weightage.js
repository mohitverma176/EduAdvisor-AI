import { state } from './state.js';
import { notifySuccess, notifyWarning } from './notifications.js';

// Default weightage (20% each for 5 subjects)
export const defaultWeightage = {
    math: 20,
    science: 20,
    english: 20,
    history: 20,
    cs: 20
};

export function initWeightage() {
    if (!state.subjectWeights) {
        state.subjectWeights = JSON.parse(JSON.stringify(defaultWeightage));
        localStorage.setItem('edu_subject_weights', JSON.stringify(state.subjectWeights));
    }
}

export function getWeightage() {
    initWeightage();
    return state.subjectWeights;
}

export function setWeightage(weights) {
    // Validate total = 100
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 0.01) {
        notifyWarning(`Total weightage must equal 100% (currently ${total}%)`);
        return false;
    }

    state.subjectWeights = weights;
    localStorage.setItem('edu_subject_weights', JSON.stringify(weights));
    notifySuccess('Subject weightages updated successfully');
    return true;
}

export function calculateWeightedAverage(marks) {
    if (!marks) return 0;
    initWeightage();
    
    const weights = state.subjectWeights;
    let total = 0;
    let weightSum = 0;

    for (const subject in marks) {
        const mark = parseFloat(marks[subject]) || 0;
        const weight = weights[subject] || 0;
        total += mark * (weight / 100);
        weightSum += weight / 100;
    }

    return weightSum > 0 ? total / weightSum : 0;
}

export function renderWeightagePanel() {
    const panel = document.createElement('div');
    panel.id = 'weightage-panel';
    panel.className = 'panel weightage-panel';
    
    initWeightage();
    const weights = state.subjectWeights;

    panel.innerHTML = `
        <div class="panel-header">
            <span class="panel-icon">⚙️</span>
            <h3 class="panel-title">Subject Weightage Manager</h3>
        </div>
        <div class="weightage-form">
            <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
                Set the importance/weight percentage for each subject. Total must equal 100%.
            </p>
            <div class="weightage-inputs">
                <div class="weightage-item">
                    <label for="weight-math">Mathematics</label>
                    <input type="number" id="weight-math" min="0" max="100" value="${weights.math}" class="weightage-input">
                    <span class="weight-display">%</span>
                </div>
                <div class="weightage-item">
                    <label for="weight-science">Science</label>
                    <input type="number" id="weight-science" min="0" max="100" value="${weights.science}" class="weightage-input">
                    <span class="weight-display">%</span>
                </div>
                <div class="weightage-item">
                    <label for="weight-english">English</label>
                    <input type="number" id="weight-english" min="0" max="100" value="${weights.english}" class="weightage-input">
                    <span class="weight-display">%</span>
                </div>
                <div class="weightage-item">
                    <label for="weight-history">History</label>
                    <input type="number" id="weight-history" min="0" max="100" value="${weights.history}" class="weightage-input">
                    <span class="weight-display">%</span>
                </div>
                <div class="weightage-item">
                    <label for="weight-cs">Computer Science</label>
                    <input type="number" id="weight-cs" min="0" max="100" value="${weights.cs}" class="weightage-input">
                    <span class="weight-display">%</span>
                </div>
            </div>
            <div class="weightage-total">
                <p>Total: <span id="weightage-total-display">100</span>%</p>
            </div>
            <div class="weightage-actions">
                <button id="save-weightage-btn" class="add-btn">Save Weightages</button>
                <button id="reset-weightage-btn" class="add-btn" style="background: #6b7280;">Reset to Default</button>
            </div>
        </div>
    `;

    // Real-time total calculation
    const inputs = panel.querySelectorAll('.weightage-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const total = Array.from(inputs)
                .reduce((sum, inp) => sum + (parseFloat(inp.value) || 0), 0);
            document.getElementById('weightage-total-display').textContent = total;
        });
    });

    // Save button
    document.getElementById('save-weightage-btn', panel)?.addEventListener('click', () => {
        const newWeights = {
            math: parseFloat(document.getElementById('weight-math', panel).value) || 0,
            science: parseFloat(document.getElementById('weight-science', panel).value) || 0,
            english: parseFloat(document.getElementById('weight-english', panel).value) || 0,
            history: parseFloat(document.getElementById('weight-history', panel).value) || 0,
            cs: parseFloat(document.getElementById('weight-cs', panel).value) || 0
        };
        setWeightage(newWeights);
    });

    // Reset button
    document.getElementById('reset-weightage-btn', panel)?.addEventListener('click', () => {
        setWeightage(defaultWeightage);
        renderWeightagePanel();
    });

    return panel;
}
