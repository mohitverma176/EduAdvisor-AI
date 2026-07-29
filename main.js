import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./firebase.js";
import { state } from "./state.js";
import { initCharts, updateChartTheme } from "./charts.js";
import { generateresponse, stopChatbot, createmsgelement } from "./chatbot.js";
import { addStudent, parseCSV, generatePDF } from "./studentManager.js";
import { notificationManager, notifySuccess, notifyWarning, notifyError, attachNotificationListeners } from "./notifications.js";
import { initWeightage, getWeightage, calculateWeightedAverage, renderWeightagePanel } from "./weightage.js";
import { initAssignments, renderAssignmentPanel, loadAssignments } from "./assignments.js";
import { renderMarksPredictorPanel } from "./marksPredictor.js";
import { renderTimelinePanel, renderTimelineChart, recordMarksSnapshot } from "./timeline.js";
import { initAttendanceHistory, renderAttendancePanel } from "./attendance.js";

// DOM Elements
const langSelector = document.querySelector("#lang-selector");
const promptform = document.querySelector(".prompt-form");
const promptinput = promptform?.querySelector(".prompt-input");
const chatscontainer = document.querySelector(".chats-container");
const fileinput = promptform?.querySelector('#file-input');
const fileupload = promptform?.querySelector('.file-upload-wrapper');
const themetoggle = document.querySelector("#theme-toggle-btn");
const expandChatBtn = document.getElementById("expand-chat-btn");
const landingPage = document.getElementById("landing-page");
const loginPage = document.getElementById("login-page");
const dashboard = document.getElementById("dashboard");
const brandLogo = document.getElementById("brand-logo");

// Role Toggle Elements
const roleStudentBtn = document.getElementById("role-student-btn");
const roleTeacherBtn = document.getElementById("role-teacher-btn");
const teacherFields = document.getElementById("teacher-fields");

// Dashboard Panels
const studentManagement = document.getElementById("student-management");
const studentSteps = document.getElementById("student-steps");
const inputPanelTitle = document.getElementById("input-panel-title");
const fileUploadSection = document.querySelector(".file-upload-section");
const pdfSection = document.querySelector(".pdf-section");

let currentRole = "student";
let currentLanguage = "en-US";

// Global translation object
const translations = {
    "en-US": {
        logo:"EduAdvisor AI",
        heading: "Welcome to EduAdvisor AI",
        subheading: "Your personal academic mentor",
        placeholder: "Ask your advisor anything...",
        disclaimer: "AI responses are for guidance. Always consult official academic catalogs.",
        sysprompt: "Please reply in English.",
        text1:"Generate a personalized study plan for exams",
        text2:"Analyze academic strengths and weaknesses",
        text3:"Suggest career paths based on these grades",
        text4:"Give advice to improve attendance & performance",
        tab_analytics: "📊 Analytics",
        tab_recommendations: "💡 Recommendations",
        tab_parent: "👨‍👩‍👦 Parent Comms",
        tab_assignments: "📝 Assignments",
        tab_attendance: "📅 Attendance",
        tab_predictor: "🎯 Predictor",
        tab_timeline: "📈 Timeline",
        tab_database: "🗄️ Database",
        tab_leaderboard: "🏆 Leaderboard",
        tab_history: "📜 Assignment History"
    },
    "hi-IN": {
        logo:"एडुएडवाइजर एआई",
        heading: "एडुएडवाइज़र एआई में आपका स्वागत है",
        subheading: "आपका व्यक्तिगत शैक्षणिक सलाहकार",
        placeholder: "अपने सलाहकार से कुछ भी पूछें...",
        disclaimer: "एआई प्रतिक्रियाएं केवल मार्गदर्शन के लिए हैं। हमेशा आधिकारिक शैक्षणिक कैटलॉग से परामर्श करें।",
        sysprompt: "Please reply in Hindi.",
        text1:"परीक्षाओं के लिए एक पर्सनलाइज़्ड स्टडी प्लान बनाएँ।",
        text2:"शैक्षणिक खूबियों और कमज़ोरियों का विश्लेषण करें।",
        text3:"इन ग्रेड्स के आधार पर करियर के रास्ते सुझाएं।",
        text4:"उपस्थिती आणि कामगिरी सुधारण्यासाठी सल्ला द्या।",
        tab_analytics: "📊 एनालिटिक्स",
        tab_recommendations: "💡 सिफारिशें",
        tab_parent: "👨‍👩‍👦 माता-पिता संचार",
        tab_assignments: "📝 असाइनमेंट",
        tab_attendance: "📅 उपस्थिति",
        tab_predictor: "🎯 भविष्यवक्ता",
        tab_timeline: "📈 टाइमलाइन",
        tab_database: "🗄️ डेटाबेस",
        tab_leaderboard: "🏆 लीडरबोर्ड",
        tab_history: "📜 असाइनमेंट इतिहास"
    },
    "ta-IN": {
        logo:"எடுஅட்வைசர் ஏஐ",
        heading: "EduAdvisor AI-க்கு வரவேற்கிறோம்",
        subheading: "உங்கள் தனிப்பட்ட கல்வி வழிகாட்டி",
        placeholder: "உங்கள் ஆலோசகரிடம் எதை வேண்டுமானாலும் கேளுங்கள்...",
        disclaimer: "செயற்கை நுண்ணறிவின் பதில்கள் வழிகாட்டுதலுக்காக மட்டுமே. எப்போதும் அதிகாரப்பூர்வ கல்விசார் பட்டியல்களைப் பார்க்கவும்.",
        sysprompt: "Please reply in tamil.",
        text1:"தேர்வுகளுக்கான தனிப்பயனாக்கப்பட்ட படிப்புத் திட்டத்தை உருவாக்குங்கள்.",
        text2:"கல்விசார் பலங்கள் மற்றும் பலவீனங்களை ஆய்வு செய்யுங்கள்.",
        text3:"இந்த மதிப்பெண்களின் அடிப்படையில் தொழில் பாதைகளைப் பரிந்துரைக்கவும்.",
        text4:"வருகை மற்றும் செயல்திறனை மேம்படுத்துவதற்கான ஆலோசனைகளை வழங்கவும்.",
        tab_analytics: "📊 பகுப்பாய்வு",
        tab_recommendations: "💡 பரிந்துரைகள்",
        tab_parent: "👨‍👩‍👦 பெற்றோர் தொடர்பு",
        tab_assignments: "📝 பணிகள்",
        tab_attendance: "📅 வருகை",
        tab_predictor: "🎯 முன்னறிவிப்பாளர்",
        tab_timeline: "📈 காலவரிசை",
        tab_database: "🗄️ தரவுத்தளம்",
        tab_leaderboard: "🏆 முன்னிலைப்பலகை",
        tab_history: "📜 பணி வரலாறு"
    },
    "mr-IN": {
        logo:"एडुएडवाइजर एआई",
        heading: "EduAdvisor AI मध्ये आपले स्वागत आहे.",
        subheading: "तुमचा वैयक्तिक शैक्षणिक मार्गदर्शक",
        placeholder: "तुमच्या सल्लागाराला काहीही विचारा...",
        disclaimer: "AI द्वारे मिळणारे प्रतिसाद केवळ मार्गदर्शनासाठी आहेत. नेहमी अधिकृत शैक्षणिक सूचींचा (academic catalogs) संदर्भ घ्या.",
        sysprompt: "Please reply in marathi.",
        text1:"परीक्षांसाठी वैयक्तिकृत अभ्यास योजना तयार करा.",
        text2:"शैक्षणिक बलस्थाने आणि उणिवांचे विश्लेषण करा.",
        text3:"या गुणांच्या आधारे करिअरच्या वाटा सुचवा.",
        text4:"उपस्थिती आणि कामगिरी सुधारण्यासाठी सल्ला द्या.",
        tab_analytics: "📊 विश्लेषण",
        tab_recommendations: "💡 शिफारसी",
        tab_parent: "👨‍👩‍👦 पालक संपर्क",
        tab_assignments: "📝 स्वाध्याय",
        tab_attendance: "📅 उपस्थिती",
        tab_predictor: "🎯 भविष्यवेत्ता",
        tab_timeline: "📈 टाइमलाइन",
        tab_database: "🗄️ डेटाबेस",
        tab_leaderboard: "🏆 लीडरबोर्ड",
        tab_history: "📜 स्वाध्याय इतिहास"
    }
};

langSelector.addEventListener("change", () => {

    currentLanguage = langSelector.value;

    const langData = translations[currentLanguage];

    if(promptinput){
        promptinput.placeholder = langData.placeholder;
    }

    // Replace all elements with a data-translate attribute
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        if (langData[key]) {
            el.textContent = langData[key];
        }
    });

});

const userdata = { message: "", file: {} };

// Initialization
window.addEventListener("DOMContentLoaded", () => {
    initCharts();
    
    // Initialize new feature modules
    initWeightage();
    initAssignments();
    loadAssignments();
    initAttendanceHistory();
    attachNotificationListeners();
    
    // Setup Student Search
    const searchInput = document.getElementById('student-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            import("./studentManager.js").then(m => m.renderStudentGrid(e.target.value));
        });
    }

    // Setup Theme
    const islighttheme = localStorage.getItem("themeColor") === "light_mode";
    document.body.classList.toggle("light-theme", islighttheme);
    if(themetoggle) themetoggle.textContent = islighttheme ? "dark_mode" : "light_mode";
});

// Theme Toggling
if (themetoggle) {
    themetoggle.addEventListener("click", () => {
        const islighttheme = document.body.classList.toggle("light-theme");
        localStorage.setItem("themeColor", islighttheme ? "light_mode" : "dark_mode");
        themetoggle.textContent = islighttheme ? "dark_mode" : "light_mode";
        updateChartTheme(islighttheme);
    });
}

// Landing Page to Login
document.getElementById("start-btn")?.addEventListener("click", () => {
    landingPage.style.display = "none";
    loginPage.style.display = "flex";
    document.getElementById("app-footer").style.display = "block"; // Show footer on login
});

// Brand Logo click
if(brandLogo) {
    brandLogo.addEventListener("click", () => {
        landingPage.style.display = "flex";
        loginPage.style.display = "none";
        dashboard.style.display = "none";
        document.getElementById("app-footer").style.display = "none"; // Hide on landing
        setTimeout(() => landingPage.classList.remove("start-transition"), 50);
    });
}

// Role Toggle Logic
if (roleStudentBtn && roleTeacherBtn) {
    roleStudentBtn.addEventListener("click", () => {
        
        currentRole = "student";
        roleStudentBtn.classList.add("active");
        roleTeacherBtn.classList.remove("active");
        teacherFields.style.display = "none";
    });
    
    roleTeacherBtn.addEventListener("click", () => {
        currentRole = "teacher";
        roleTeacherBtn.classList.add("active");
        roleStudentBtn.classList.remove("active");
        teacherFields.style.display = "block";
    });
}

// Login
document.getElementById("login-btn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const school = document.getElementById("school").value;
    const className = document.getElementById("class").value;

    try {
        if (currentRole === "student") {
            const matchedStudent = state.students.find(s => s.login === email && s.password === password);
            
            // Setup Tabs for Student
            document.getElementById("tabs-nav").style.display = "flex";
            document.getElementById("tab-parent").style.display = "none";
            document.getElementById("tab-database").style.display = "none"; // Hide database from student
            document.getElementById("tab-leaderboard").style.display = "none"; // Hide leaderboard from student
            document.getElementById("tab-recommendations").style.display = "block";
            const timelineTab = document.getElementById("tab-timeline");
            if (timelineTab) timelineTab.style.display = "block";
            
            if (matchedStudent) {
                // Student was created by Teacher
                state.activeStudent = matchedStudent;
                studentManagement.style.display = "none";
                studentSteps.style.display = "none"; 
                fileUploadSection.style.display = "block"; // Show CSV for student
                pdfSection.style.display = "block";
                inputPanelTitle.textContent = "Student Dashboard";
                inputPanelTitle.previousElementSibling.textContent = "👤";
                
                // Show Assignment & Attendance for created students
                document.getElementById("tab-assignments").style.display = "block";
                document.getElementById("tab-attendance").style.display = "block";
                
                loginPage.style.display = "none";
                dashboard.style.display = "block";
                
                import("./charts.js").then(m => m.updateChartsAndKPIs(matchedStudent));
                return;
            } else {
                // Regular student login
                await signInWithEmailAndPassword(auth, email, password);
                studentManagement.style.display = "none";
                studentSteps.style.display = "block";
                fileUploadSection.style.display = "block"; // Show CSV for student
                pdfSection.style.display = "block";
                inputPanelTitle.textContent = "Student Profile";
                inputPanelTitle.previousElementSibling.textContent = "👤";
                
                // Hide Assignment & Attendance for regular students
                document.getElementById("tab-assignments").style.display = "none";
                document.getElementById("tab-attendance").style.display = "none";
            }
        } else {
            // Teacher login
            await signInWithEmailAndPassword(auth, email, password);
            state.teacherDetails.school = school;
            state.teacherDetails.class = className;
            state.teacherDetails.teacherId = email; // Store teacher email for access control
            studentManagement.style.display = "block";
            studentSteps.style.display = "none";
            inputPanelTitle.textContent = "Class Roster";
            inputPanelTitle.previousElementSibling.textContent = "👥";
            
            // Setup Tabs for Teacher
            document.getElementById("tabs-nav").style.display = "flex";
            document.getElementById("tab-database").style.display = "block";
            document.getElementById("tab-leaderboard").style.display = "block";
            document.getElementById("tab-parent").style.display = "block";
            document.getElementById("tab-assignment-history").style.display = "block";
            document.getElementById("tab-recommendations").style.display = "none"; // Hide recs tab
            const timelineTab = document.getElementById("tab-timeline");
            if (timelineTab) timelineTab.style.display = "none";
            
            if (state.students.length === 0) {
                    // Create dummy student if roster is empty
                    import("./studentManager.js").then(m => m.addStudent());
                } else {
                    import("./studentManager.js").then(m => m.renderStudentGrid());
                }
            }
        
        loginPage.style.display = "none";
        dashboard.style.display = "block";
    } catch (error) {
        alert(error.message);
    }
});

// Logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
    auth.signOut().then(() => {
        state.activeStudent = null;
        if (state.teacherDetails) state.teacherDetails.teacherId = null;
        dashboard.style.display = "none";
        loginPage.style.display = "flex";
        document.getElementById("app-footer").style.display = "block";
        document.getElementById("ai-chat-view").style.display = "none";
        
        // Hide tabs and reset views
        document.getElementById("tabs-nav").style.display = "none";
        document.getElementById("dashboard-view").style.display = "grid";
        document.getElementById("recommendations-view").style.display = "none";
        document.getElementById("parent-view").style.display = "none";
        document.getElementById("database-view").style.display = "none";
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.getElementById("tab-analytics").classList.add("active");
        
        // Clear login fields
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    });
});

// AI Chat Dedicated Page Toggles
document.getElementById("open-ai-chat-btn")?.addEventListener("click", () => {
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("recommendations-view").style.display = "none";
    document.getElementById("parent-view").style.display = "none";
    document.getElementById("database-view").style.display = "none";
    document.getElementById("tabs-nav").style.display = "none";
    document.getElementById("ai-chat-view").style.display = "block";
});
document.getElementById("close-ai-chat-btn")?.addEventListener("click", () => {
    document.getElementById("ai-chat-view").style.display = "none";
    document.getElementById("tabs-nav").style.display = "flex";
    
    // Trigger click on the currently active tab to restore view
    const activeTab = document.querySelector(".tab-btn.active");
    if(activeTab) activeTab.click();
});

// Tab Switching
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        
        // Switch active view
        const views = [
            "dashboard-view", "recommendations-view", "parent-view",
            "assignments-view", "attendance-view", "weightage-view", 
            "predictor-view", "timeline-view", "database-view",
            "assignment-history-view", "leaderboard-view"
        ];
        
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.style.display = "none";
        });
        
        const tabId = e.target.id;
        if (tabId === "tab-analytics") {
            document.getElementById("dashboard-view").style.display = "grid";
        } else if (tabId === "tab-assignments") {
            const assignmentView = document.getElementById("assignments-view");
            assignmentView.style.display = "block";
            assignmentView.innerHTML = "";
            const isTeacher = currentRole === "teacher";
            const panel = renderAssignmentPanel(isTeacher);
            assignmentView.appendChild(panel);
            // Re-render list AFTER panel is in DOM
            import("./assignments.js").then(m => m.renderAssignmentsList(isTeacher));
        } else if (tabId === "tab-attendance") {
            const attendanceView = document.getElementById("attendance-view");
            attendanceView.style.display = "block";
            attendanceView.innerHTML = "";
            if (state.activeStudent) {
                const isTeacher = currentRole === "teacher";
                const panel = renderAttendancePanel(state.activeStudent, isTeacher);
                if (panel) attendanceView.appendChild(panel);
            } else {
                attendanceView.innerHTML = '<div style="padding: 20px;"><p>Please select a student first</p></div>';
            }
        } else if (tabId === "tab-weightage") {
            const weightageView = document.getElementById("weightage-view");
            weightageView.style.display = "block";
            weightageView.innerHTML = "";
            const panel = renderWeightagePanel();
            if (panel) weightageView.appendChild(panel);
        } else if (tabId === "tab-predictor") {
            const predictorView = document.getElementById("predictor-view");
            predictorView.style.display = "block";
            predictorView.innerHTML = "";
            if (state.activeStudent) {
                const isTeacher = currentRole === "teacher";
                const panel = renderMarksPredictorPanel(state.activeStudent, isTeacher);
                if (panel) predictorView.appendChild(panel);
            } else {
                predictorView.innerHTML = '<div style="padding: 20px;"><p>Please select a student first</p></div>';
            }
        } else if (tabId === "tab-timeline") {
            const timelineView = document.getElementById("timeline-view");
            timelineView.style.display = "block";
            timelineView.innerHTML = "";
            if (state.activeStudent) {
                const panel = renderTimelinePanel(state.activeStudent);
                if (panel) timelineView.appendChild(panel);
                const chart = renderTimelineChart(state.activeStudent);
                if (chart) timelineView.appendChild(chart);
            } else {
                timelineView.innerHTML = '<div style="padding: 20px;"><p>Please select a student first</p></div>';
            }
        } else if (tabId === "tab-recommendations") {
            document.getElementById("recommendations-view").style.display = "block";
        } else if (tabId === "tab-parent") {
            const parentView = document.getElementById("parent-view");
            parentView.style.display = "block";
            
            // Populate student dropdown for parent comms
            import("./parentComms.js").then(m => m.initParentComms());
        } else if (tabId === "tab-assignment-history") {
            const historyView = document.getElementById("assignment-history-view");
            historyView.style.display = "block";
            import("./assignmentHistory.js").then(m => m.renderAssignmentHistory());
        } else if (tabId === "tab-database") {
            const dbView = document.getElementById("database-view");
            dbView.style.display = "block";
            import("./studentManager.js").then(m => m.renderDatabaseView());
        } else if (tabId === "tab-leaderboard") {
            const leaderboardView = document.getElementById("leaderboard-view");
            leaderboardView.style.display = "block";
            import("./studentManager.js").then(m => m.renderLeaderboardView());
        }
    });
});

// Recommendations click -> Chat
document.querySelectorAll(".rec-card").forEach(card => {
    card.addEventListener("click", () => {
        if (card.id === "nav-ai-chat-card") {
            document.getElementById("open-ai-chat-btn")?.click();
            return;
        }
        
        const topic = card.getAttribute("data-topic");
        if (promptinput && topic) {
            promptinput.value = "I need advice on: " + topic;
            
            // Switch back to analytics tab
            document.getElementById("tab-analytics").click();
            
            // Open the AI chat page
            document.getElementById("open-ai-chat-btn").click();
            
            // Auto submit form to Gemini
            const event = new Event('submit', { cancelable: true });
            promptform.dispatchEvent(event);
        }
    });
});

// Signup
document.getElementById("signup-btn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account Created. You can now login.");
    } catch (error) {
        alert(error.message);
    }
});

// Student Management
document.getElementById("add-student-btn")?.addEventListener("click", () => addStudent());
document.getElementById("generate-pdf-btn")?.addEventListener("click", generatePDF);
document.getElementById("sidebar-parent-btn")?.addEventListener("click", () => document.getElementById("tab-parent")?.click());

const csvFileInput = document.getElementById("csv-file-input");
if (csvFileInput) {
    csvFileInput.addEventListener("change", () => {
        if (csvFileInput.files[0]) {
            parseCSV(csvFileInput.files[0]);
            csvFileInput.value = ""; // reset
        }
    });
}

// Chatbot functionality
const handleformSubmit = (e) => {
    if (e) e.preventDefault();
    const usermessage = promptinput.value.trim();
    if (!usermessage || document.body.classList.contains("bot-responding")) return;
    
    promptinput.value = "";
    document.body.classList.add("bot-responding", "chats-active");
    if(fileupload) fileupload.classList.remove("active", "img-attached", "file-attached");

    const usermsgHTML = `<p class="message-text"></p>`;
    const usermsgdiv = createmsgelement(usermsgHTML, "user-message");
    usermsgdiv.querySelector(".message-text").textContent = usermessage;
    chatscontainer.appendChild(usermsgdiv);
    document.querySelector(".chat-inner-container").scrollTo({ top: document.querySelector(".chat-inner-container").scrollHeight, behavior: "smooth" });
     
    setTimeout(() => {
        const botmsghtml = `<img src="gemini logo.svg" class="avatar"><div class="message-content"><div class="message-text">Analyzing profile and writing suggestions...</div></div>`;
        const botmsgdiv = createmsgelement(botmsghtml, "bot-message", "loading");
        chatscontainer.appendChild(botmsgdiv);
        document.querySelector(".chat-inner-container").scrollTo({ top: document.querySelector(".chat-inner-container").scrollHeight, behavior: "smooth" });
       generateresponse(
    botmsgdiv,
    translations[currentLanguage],
    currentLanguage,
    usermessage
);
    }, 600);
}

if(promptform) promptform.addEventListener("submit", handleformSubmit);

document.querySelector("#stop-prompt-btn")?.addEventListener("click", () => {
    stopChatbot();
    chatscontainer.querySelector(".bot-message.loading")?.classList.remove("loading");
    document.body.classList.remove("bot-responding", "bot-speaking");
});

document.querySelector("#delete-chats-btn")?.addEventListener("click", () => {
    chatscontainer.innerHTML = "";
    document.body.classList.remove("bot-responding", "chats-active");
});

if (expandChatBtn) {
    expandChatBtn.addEventListener("click", () => {
        const dashboardGrid = document.querySelector(".dashboard-grid");
        const isExpanded = dashboardGrid.classList.toggle("chat-expanded");
        expandChatBtn.textContent = isExpanded ? "close_fullscreen" : "open_in_full";
        expandChatBtn.setAttribute("title", isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen");
    });
}

document.querySelectorAll(".suggestion-lines").forEach(item => {
    item.addEventListener("click", () => {
        promptinput.value = item.querySelector(".text").textContent;
        promptform.dispatchEvent(new Event("submit"));
    });
});

// Student Multi-Step Form Logic
const steps = document.querySelectorAll(".step");
let currentStep = 0;

const showStep = (index) => {
    steps.forEach(step => step.classList.remove("active"));
    if(steps[index]) steps[index].classList.add("active");
};

document.querySelectorAll(".next-btn").forEach(button => {
    button.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });
});

document.querySelectorAll(".back-btn").forEach(button => {
    button.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

document.querySelector(".finish-btn")?.addEventListener("click", () => {
    const sName = document.querySelector("#student-name").value;
    const sClass = document.querySelector("#student-class").value;
    const sAtt = parseFloat(document.querySelector("#student-attendance").value) || 0;
    const mMath = parseFloat(document.querySelector("#mark-math").value) || 0;
    const mSci = parseFloat(document.querySelector("#mark-science").value) || 0;
    const mEng = parseFloat(document.querySelector("#mark-english").value) || 0;
    const mHist = parseFloat(document.querySelector("#mark-history").value) || 0;
    const mCs = parseFloat(document.querySelector("#mark-cs").value) || 0;
    
    // Set as active student to trigger charts
    const student = {
        name: sName,
        class: sClass,
        attendance: sAtt,
        marks: { math: mMath, science: mSci, english: mEng, history: mHist, cs: mCs }
    };
    
    state.activeStudent = student;
    recordMarksSnapshot(student);
    import("./charts.js").then(m => m.updateChartsAndKPIs(student));
    notifySuccess("Student Profile Created Successfully 🎓");
    alert("Student Profile Created Successfully 🎓");
});

// Live update for student manual inputs
document.querySelectorAll("#student-name, #student-class, #student-attendance, .subject-mark").forEach(input => {
    input.addEventListener("input", () => {
        if (currentRole === "student") {
            const sAtt = parseFloat(document.querySelector("#student-attendance").value) || 0;
            const mMath = parseFloat(document.querySelector("#mark-math").value) || 0;
            const mSci = parseFloat(document.querySelector("#mark-science").value) || 0;
            const mEng = parseFloat(document.querySelector("#mark-english").value) || 0;
            const mHist = parseFloat(document.querySelector("#mark-history").value) || 0;
            const mCs = parseFloat(document.querySelector("#mark-cs").value) || 0;
            
            state.activeStudent = {
                name: document.querySelector("#student-name").value,
                class: document.querySelector("#student-class").value,
                attendance: sAtt,
                marks: { math: mMath, science: mSci, english: mEng, history: mHist, cs: mCs }
            };
            import("./charts.js").then(m => m.updateChartsAndKPIs(state.activeStudent));
        }
    });
});

// Footer static pages logic
const staticPagesContent = {
about: `
<div class="about-page">
    <h1>🎓 About EduAdvisor AI</h1>
    <p class="about-intro">
        <strong>EduAdvisor AI</strong> is an AI-powered academic guidance platform
        designed to help students, teachers, and parents make better educational
        decisions. It analyzes student performance, attendance, and subject-wise
        marks to provide personalized recommendations, study plans, and career
        guidance through an intelligent dashboard.
    </p>
    <div class="about-grid">
        <div class="about-card">
            <h2>🎯 Our Mission</h2>
            <p>
                To make academic counseling smarter by combining Artificial
                Intelligence with data analytics, enabling every student to
                achieve their full potential.
            </p>
        </div>
        <div class="about-card">
            <h2>🚀 Key Features</h2>
            <table class="about-table">
                <tr>
                    <th>Feature</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td>Student Dashboard</td>
                    <td>Visualize marks, attendance and overall performance.</td>
                </tr>
                <tr>
                    <td>AI Advisor</td>
                    <td>Personalized study plans and career guidance.</td>
                </tr>
                <tr>
                    <td>Performance Analytics</td>
                    <td>Interactive Pie & Bar charts.</td>
                </tr>
                <tr>
                    <td>CSV Import</td>
                    <td>Upload multiple student records instantly.</td>
                </tr>
                <tr>
                    <td>PDF Reports</td>
                    <td>Generate printable academic reports.</td>
                </tr>
            </table>
        </div>
<div class="about-card">
    <h2>🚀 Future Scope</h2>
    <table class="about-table">
        <tr>
            <td>📱 Mobile Application</td>
            <td>Develop Android & iOS versions for easier access.</td>
        </tr>
        <tr>
            <td>🌐 More language Support</td>
            <td>Support additional regional and international languages.</td>
        </tr>
        <tr>
            <td>🤖 Advanced AI Models</td>
            <td>Integrate more powerful AI models for accurate academic guidance.</td>
        </tr>
        <tr>
            <td>☁️ Cloud Database</td>
            <td>Store student records securely using Firebase or cloud services.</td>
        </tr>
    </table>
</div>
    </div>
    <div class="about-card" style="margin-top:30px;">
        <h2>📞 Contact Information</h2>
        <table class="about-table">
            <tr>
                <td>Email</td>
                <td>support@eduadvisorai.com</td>
            </tr>
            <tr>
                <td>Phone</td>
                <td>+91 88007 31443</td>
            </tr>
            <tr>
                <td>Address</td>
                <td>New Delhi, India</td>
            </tr>
            <tr>
                <td>Working Hours</td>
                <td>Monday - Saturday (9:00 AM - 6:00 PM)</td>
            </tr>
        </table>
    </div>
</div>
`,
team: `
<div class="about-page">
<h1>👨‍💻 Team Members</h1>
<p class="about-intro">
Meet the passionate team behind <strong>EduAdvisor AI</strong>. Our members combine expertise in Artificial Intelligence, Web Development, and Data Analytics to create an intelligent academic guidance platform.
</p>
<div class="about-grid">
<div class="about-card">
<h2>👨‍💻 Team Overview</h2>
<table class="about-table">
<tr>
<th>Role</th>
<th>Responsibility</th>
</tr>
<tr>
            <td>Mohit</td>
            <td>Backend Development & Component Development</td>
        </tr>

        <tr>
            <td>Swathik Samir</td>
            <td>Testing, Bug Fixing & Final Project Integration</td>
        </tr>
        <tr>
            <td>Satyam Rana</td>
            <td>Website UI Improvements, Final Touch-ups & Presentation Preparation</td>
        </tr>

</table>
</div>
<div class="about-card">
<h2>🎯 Technologies Used</h2>
<table class="about-table">
<tr><td>Frontend</td><td>HTML, CSS, JavaScript</td></tr>

<tr><td>Backend</td><td>Firebase</td></tr>

<tr><td>Charts</td><td>Chart.js</td></tr>

<tr><td>AI Model</td><td>Google Gemini API</td></tr>

<tr><td>PDF</td><td>html2pdf.js</td></tr>

</table>

</div>

</div>

</div>
`,
authorities: `
<div class="about-page">

<h1>🏫 Authorities</h1>

<p class="about-intro">
EduAdvisor AI is developed as an educational project following academic standards and ethical AI practices.
</p>

<div class="about-grid">

<div class="about-card">

<h2>📋 Project Information</h2>

<table class="about-table">

<tr><th>Category</th><th>Details</th></tr>

<tr><td>Project Name</td><td>EduAdvisor AI</td></tr>

<tr><td>Project Type</td><td>Web Development with AI</td></tr>

<tr><td>Department</td><td>AICTE IDEA LAB</td></tr>

<tr><td>Institution</td><td>USICT</td></tr>

<tr><td>Academic Year</td><td>2028</td></tr>

</table>

</div>

<div class="about-card">

<h2>✅ Supervision</h2>

<p>
This project is developed under the guidance of Ms. Sonam and follows educational best practices. All AI recommendations are intended only as academic assistance.
</p>

</div>

</div>

</div>
`,
contact: `
<div class="about-page">

<h1>📞 Contact Us</h1>

<p class="about-intro">
We are always happy to hear your suggestions, questions and feedback.
</p>

<div class="about-grid">

<div class="about-card">

<h2>📧 Contact Details</h2>

<table class="about-table">

<tr><td>Email</td><td>support@eduadvisorai.com</td></tr>

<tr><td>Phone</td><td>+91 88007 31443</td></tr>

<tr><td>Address</td><td>New Delhi, India</td></tr>

<tr><td>Working Hours</td><td>Monday - Saturday (9 AM - 6 PM)</td></tr>

</table>

</div>

<div class="about-card">

<h2>🌐 Support</h2>

<table class="about-table">

<tr><td>Website</td><td>www.eduadvisorai.com</td></tr>

<tr><td>Email Support</td><td>24×7</td></tr>

<tr><td>Technical Help</td><td>Available</td></tr>

<tr><td>Live Chat</td><td>Business Hours</td></tr>

</table>

</div>

</div>

</div>
`,
privacy: `
<div class="about-page">

<h1>🔒 Privacy Policy</h1>

<p class="about-intro">
Your privacy is important to us. EduAdvisor AI follows responsible data handling practices to ensure student information remains protected.
</p>

<div class="about-card">

<table class="about-table">

<tr>
<th>Policy</th>
<th>Description</th>
</tr>

<tr>
<td>Data Collection</td>
<td>Only educational information required for analysis is collected.</td>
</tr>

<tr>
<td>Data Security</td>
<td>Student records are securely stored and protected.</td>
</tr>

<tr>
<td>Third-Party Sharing</td>
<td>No personal information is sold or shared without consent.</td>
</tr>

<tr>
<td>AI Usage</td>
<td>Academic data is processed only to generate recommendations.</td>
</tr>

<tr>
<td>User Rights</td>
<td>Users may request deletion or correction of their information.</td>
</tr>

</table>

</div>

</div>
`,
disclaimer: `
<div class="about-page">

<h1>⚠ Disclaimer</h1>

<p class="about-intro">
The recommendations generated by EduAdvisor AI are intended to assist students and teachers and should not replace professional academic counseling.
</p>

<div class="about-card">

<table class="about-table">

<tr>
<th>Notice</th>
<th>Information</th>
</tr>

<tr>
<td>AI Recommendations</td>
<td>Generated automatically using Artificial Intelligence.</td>
</tr>

<tr>
<td>Educational Purpose</td>
<td>Designed for learning and academic guidance only.</td>
</tr>

<tr>
<td>No Guarantee</td>
<td>Recommendations may not always be completely accurate.</td>
</tr>

<tr>
<td>Decision Making</td>
<td>Always consult teachers or academic counselors before making important decisions.</td>
</tr>

<tr>
<td>Liability</td>
<td>The developers are not responsible for decisions made solely based on AI-generated suggestions.</td>
</tr>

</table>

</div>

</div>
`
};

document.querySelectorAll(".footer-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const target = link.getAttribute("data-target");

        if (staticPagesContent[target]) {
            document.getElementById("dashboard-view").style.display = "none";
            document.getElementById("recommendations-view").style.display = "none";
            document.getElementById("parent-view").style.display = "none";
            document.getElementById("database-view").style.display = "none";
            document.getElementById("ai-chat-view").style.display = "none";

            document.getElementById("static-page-view").style.display = "block";
            document.getElementById("static-title").textContent = link.textContent;
            document.getElementById("static-content").innerHTML = staticPagesContent[target];

            // Scroll to the top smoothly
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });
});
document.getElementById("close-static-btn")?.addEventListener("click", () => {
    document.getElementById("static-page-view").style.display = "none";
    document.getElementById("tabs-nav").style.display = "flex";
    
    // Trigger click on the currently active tab to restore view
    const activeTab = document.querySelector(".tab-btn.active");
    if(activeTab) activeTab.click();
    else document.getElementById("tab-analytics")?.click();
});
