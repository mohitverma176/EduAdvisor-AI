const promptform = document.querySelector(".prompt-form");
const chatscontainer = document.querySelector(".chats-container");
const langSelector = document.querySelector("#lang-selector");
const promptinput = promptform.querySelector(".prompt-input");
const chatInnerContainer = document.querySelector(".chat-inner-container");
const fileinput = promptform.querySelector('#file-input');
const fileupload = promptform.querySelector('.file-upload-wrapper');
const themetoggle = document.querySelector("#theme-toggle-btn");
const logo = document.querySelector(".brand");
const userdata = { message: "", file: {} };
const text1=document.querySelector(".text1");
const text2=document.querySelector(".text2");
const text3=document.querySelector(".text3");
const text4=document.querySelector(".text4");
import {

auth,
db,
createUserWithEmailAndPassword,
signInWithEmailAndPassword

}
from "./firebase.js";

const chatbothistory = [];

let controller;
let pieChart = null;
let barChart = null;

// Translations for Multilingual Support in advising
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
        text4:"Give advice to improve attendance & performance"
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
        text4:"परीक्षाओं के लिए एक पर्सनलाइज़्ड स्टडी प्लान बनाएँ।"
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
        text4:"வருகை மற்றும் செயல்திறனை மேம்படுத்துவதற்கான ஆலோசனைகளை வழங்கவும்."
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
        text4:"उपस्थिती आणि कामगिरी सुधारण्यासाठी सल्ला द्या."
    }
};

langSelector.addEventListener("change", (e) => {
    const lang = e.target.value;
    const langData = translations[lang];
    if (langData) {
        document.querySelector(".heading").textContent = langData.heading;
        document.querySelector(".sub-heading").textContent = langData.subheading;
        promptinput.placeholder = langData.placeholder;
        document.querySelector(".disclaimer-text").textContent = langData.disclaimer;
        document.querySelector(".brand").textContent=langData.logo;
        text1.textContent=langData.text1;
        text2.textContent=langData.text2;
        text3.textContent=langData.text3;
        text4.textContent=langData.text4;
    }
});

// Helper to create message elements
const createmsgelement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const scrollTobottom = () => chatInnerContainer.scrollTo({ top: chatInnerContainer.scrollHeight, behavior: "smooth" });

const parseResponseToHTML = (text) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points
    html = html.replace(/^\* (.*$)/gim, '<li class="chat-li">$1</li>');
    html = html.replace(/(<li class="chat-li">.*<\/li>)/gs, '<ul class="chat-list">$1</ul>');

    let parts = html.split(/##\s+/);
    let finalHtml = parts[0] ? `<div class="chat-paragraph">${parts[0].replace(/\n/g, '<br>')}</div>` : '';

    for (let i = 1; i < parts.length; i++) {
        let lines = parts[i].split('\n');
        let title = lines[0];
        let content = lines.slice(1).join('\n').trim();
        content = content.replace(/\n/g, '<br>');
        
        finalHtml += `
            <details class="chat-accordion" open>
                <summary>📌 ${title}</summary>
                <div class="accordion-content">
                    ${content}
                </div>
            </details>
        `;
    }
    return finalHtml;
}

const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const cleanText = text.replace(/[#*]/g, '').replace(/_/g, ' ').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
            document.body.classList.add("bot-speaking");
        };
        utterance.onend = () => {
            document.body.classList.remove("bot-speaking");
        };
        utterance.onerror = () => {
            document.body.classList.remove("bot-speaking");
        };
        
        window.speechSynthesis.speak(utterance);
    }
};

const renderStructuredResponse = (text, textelement, botmsgdiv) => {
    botmsgdiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    
    textelement.innerHTML = parseResponseToHTML(text);
    textelement.classList.add("fade-in-content");
    
    // Add interactive advising suggestion actions
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("chat-actions-container");
    actionContainer.innerHTML = `
        <div class="actions-section">
            <p class="action-heading">👉 Recommended Academic Tasks:</p>
            <div class="action-buttons">
                <button class="action-btn" data-prompt="Can you draft a comprehensive weekly study plan to help me improve my grades, especially in my lower scoring subjects?">📅 Generate Study Plan</button>
                <button class="action-btn" data-prompt="Based on my current grades, what are my core academic strengths and weaknesses? What should I focus on?">🧠 Strengths & Weaknesses</button>
                <button class="action-btn" data-prompt="What universities or career paths align best with my subject strengths?">🚀 Career Pathways</button>
            </div>
        </div>
        <div class="actions-section">
            <p class="action-heading">🧠 Student Counsel:</p>
            <div class="suggestion-chips">
                <button class="chip-btn" data-prompt="Provide some practical tips to improve study concentration and time management.">Study Tips</button>
                <button class="chip-btn" data-prompt="How can I improve my school attendance and maintain focus in class?">Attendance Advice</button>
            </div>
        </div>
    `;
    
    botmsgdiv.querySelector('.message-content').appendChild(actionContainer);
    
    const btns = actionContainer.querySelectorAll("button");
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            promptinput.value = btn.getAttribute("data-prompt");
            promptform.dispatchEvent(new Event("submit"));
        });
    });
    
    scrollTobottom();
}

const generateresponse = async (botmsgdiv) => {
    const textelement = botmsgdiv.querySelector(".message-text");
    controller = new AbortController();

    const langData = translations[langSelector.value] || translations["en-US"];

    // Retrieve live Student metrics from the dashboard form
    const studentName = document.querySelector("#student-name").value;
    const studentClass = document.querySelector("#student-class").value;
    const studentAttendance = document.querySelector("#student-attendance").value;
    const markMath = document.querySelector("#mark-math").value;
    const markScience = document.querySelector("#mark-science").value;
    const markEnglish = document.querySelector("#mark-english").value;
    const markHistory = document.querySelector("#mark-history").value;
    const markCs = document.querySelector("#mark-cs").value;
    const avgScore = document.getElementById("val-gpa").textContent;
    const riskLevel = document.getElementById("val-risk").textContent;
    const attStatus = document.getElementById("badge-attendance").textContent;

    const advisorContext = `You are an encouraging, professional Academic Advisor and Student Counselor.
Here is the live academic profile of the student you are advising:
- Student Name: ${studentName}
- Class/Grade: ${studentClass}
- Attendance Rate: ${studentAttendance}% (Status: ${attStatus})
- Mathematics Score: ${markMath}/100
- Science Score: ${markScience}/100
- English Score: ${markEnglish}/100
- History Score: ${markHistory}/100
- Computer Science Score: ${markCs}/100
- Overall Average Grade: ${avgScore}
- Academic Risk Status: ${riskLevel}

Provide helpful, empathetic, and actionable guidance based on these metrics. Suggest ways to address weaknesses and build on strengths.
Format your response clearly. Use '## ' (e.g. ## Strengths & Weaknesses) for major sections so I can create accordions. Ensure all bold text uses markdown **bold**. ${langData.sysprompt}
User Query: ${userdata.message}`;

    chatbothistory.push({
        role: "user",
        parts: [{ text: advisorContext }, ...(userdata.file.data ? [{ inline_data: (({ fillName, isimage, ...rest }) => rest)(userdata.file) }] : [])]
    });

    try {
                let response;

        for(let i = 0; i < 3; i++){

            response = await fetch("http://localhost:3000/chat", {
                             method: "POST",
                             headers: {
                               "Content-Type": "application/json",
                             },
                             body: JSON.stringify({
                               contents: chatbothistory,
                             }),
                             signal: controller.signal,
                           });
            if(response.status !== 503){
                break;
            }
            await new Promise(
                resolve=>setTimeout(resolve,2000)
            );

        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        
        const responseText = data.candidates[0].content.parts[0].text;
        renderStructuredResponse(responseText, textelement, botmsgdiv);
        
        speakText(responseText, langSelector.value);

        chatbothistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });
    } catch (error) {
        textelement.style.color = "#ef4444";
        textelement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        botmsgdiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
    } finally {
        userdata.file = {};
    }
}

// Handle form submission
const handleformSubmit = (e) => {
    if (e) e.preventDefault();
    const usermessage = promptinput.value.trim();
    if (!usermessage || document.body.classList.contains("bot-responding")) return;
    
    promptinput.value = "";
    userdata.message = usermessage;
    document.body.classList.add("bot-responding", "chats-active");
    fileupload.classList.remove("active", "img-attached", "file-attached");

    const usermsgHTML = `<p class="message-text"></p>
    ${userdata.file.data ? (userdata.file.isimage ? `<img src="data:${userdata.file.mime_type};base64,${userdata.file.data}" class="img-attachment"/>` : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userdata.file.fileName}</p>`) : ""}`;

    const usermsgdiv = createmsgelement(usermsgHTML, "user-message");
    usermsgdiv.querySelector(".message-text").textContent = usermessage;
    chatscontainer.appendChild(usermsgdiv);
    scrollTobottom();
     
    setTimeout(() => {
        const botmsghtml = `<img src="gemini logo.svg" class="avatar"><div class="message-content"><div class="message-text">Analyzing profile and writing suggestions...</div></div>`;
        const botmsgdiv = createmsgelement(botmsghtml, "bot-message", "loading");
        chatscontainer.appendChild(botmsgdiv);
        scrollTobottom();
        generateresponse(botmsgdiv);
    }, 600);
}

// Chart.js Setup
const initCharts = () => {
    const pieCanvas = document.getElementById('marksPieChart');
    const barCanvas = document.getElementById('marksBarChart');
    if (!pieCanvas || !barCanvas) return;

    const pieCtx = pieCanvas.getContext('2d');
    const barCtx = barCanvas.getContext('2d');

    const labels = ['Mathematics', 'Science', 'English', 'History', 'Computer Sci'];
    const initialMarks = [92, 88, 85, 78, 96];

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
}

// Calculate Academic Standing, Grade averages and Update KPIs
const updateDashboard = () => {
    const studentName = document.querySelector("#student-name").value.trim();
    const studentClass = document.querySelector("#student-class").value.trim();
    const studentAttendance = parseFloat(document.querySelector("#student-attendance").value) || 0;

    const math = parseFloat(document.querySelector("#mark-math").value) || 0;
    const science = parseFloat(document.querySelector("#mark-science").value) || 0;
    const english = parseFloat(document.querySelector("#mark-english").value) || 0;
    const history = parseFloat(document.querySelector("#mark-history").value) || 0;
    const cs = parseFloat(document.querySelector("#mark-cs").value) || 0;

    const marksArray = [math, science, english, history, cs];
    const avgScore = (marksArray.reduce((acc, curr) => acc + curr, 0) / marksArray.length).toFixed(1);

    // Update Average KPI Card
    document.getElementById("val-gpa").textContent = `${avgScore}%`;
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
    
    // Risk formula: High risk if failing marks (<60 avg) or critical attendance (<75)
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
}

// Preset Sample Student Data Profiles
const sampleStudents = {
    alex: {
        name: "Alex Morgan",
        class: "Grade 11",
        attendance: 95,
        marks: { math: 92, science: 88, english: 85, history: 78, cs: 96 }
    },
    sarah: {
        name: "Sarah Jenkins",
        class: "Grade 11",
        attendance: 82,
        marks: { math: 58, science: 72, english: 88, history: 91, cs: 68 }
    },
    daniel: {
        name: "Daniel Chen",
        class: "Grade 11",
        attendance: 64,
        marks: { math: 45, science: 52, english: 61, history: 55, cs: 50 }
    }
};

const sampleSelector = document.getElementById("sample-selector");


if(sampleSelector){

sampleSelector.addEventListener("change",(e)=>{


const val = e.target.value;


const student = sampleStudents[val];


if(student){


document.querySelector("#student-name").value = student.name;

document.querySelector("#student-class").value = student.class;

document.querySelector("#student-attendance").value = student.attendance;


document.querySelector("#mark-math").value = student.marks.math;

document.querySelector("#mark-science").value = student.marks.science;

document.querySelector("#mark-english").value = student.marks.english;

document.querySelector("#mark-history").value = student.marks.history;

document.querySelector("#mark-cs").value = student.marks.cs;


updateDashboard();


}


});


}

// CSV Transcript File Parsing
const csvFileInput = document.getElementById("csv-file-input");
if (csvFileInput) {
    csvFileInput.addEventListener("change", () => {
        const file = csvFileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split("\n");
            
            const fieldMapping = {
                name: ["name", "student name", "student_name", "fullname", "full name"],
                grade_class: ["class", "grade", "class/grade", "class_grade"],
                attendance: ["attendance", "attendance %", "attendance_percent", "attendancepercent"],
                math: ["math", "mathematics", "maths"],
                science: ["science", "sci"],
                english: ["english", "eng"],
                history: ["history", "hist"],
                cs: ["cs", "computer science", "computer sci", "computerscience"]
            };

            let parsed = {};

            lines.forEach(line => {
                if (!line.trim()) return;
                const parts = line.split(",");
                if (parts.length < 2) return;

                const rawKey = parts[0].trim().toLowerCase();
                const val = parts[1].trim();

                for (let field in fieldMapping) {
                    if (fieldMapping[field].includes(rawKey)) {
                        parsed[field] = val;
                        break;
                    }
                }
            });

            // Populate form fields with parsed CSV values
            if (parsed.name) document.querySelector("#student-name").value = parsed.name;
            if (parsed.grade_class) document.querySelector("#student-class").value = parsed.grade_class;
            if (parsed.attendance) document.querySelector("#student-attendance").value = parseFloat(parsed.attendance) || 0;
            if (parsed.math) document.querySelector("#mark-math").value = parseInt(parsed.math) || 0;
            if (parsed.science) document.querySelector("#mark-science").value = parseInt(parsed.science) || 0;
            if (parsed.english) document.querySelector("#mark-english").value = parseInt(parsed.english) || 0;
            if (parsed.history) document.querySelector("#mark-history").value = parseInt(parsed.history) || 0;
            if (parsed.cs) document.querySelector("#mark-cs").value = parseInt(parsed.cs) || 0;

            updateDashboard();

            // Notify user inside chat interface
            const notifyHTML = `<p class="message-text">📂 Loaded transcript CSV file successfully. Student Profile updated for <strong>${parsed.name || "Parsed Profile"}</strong>.</p>`;
            const notifyDiv = createmsgelement(notifyHTML, "bot-message");
            chatscontainer.appendChild(notifyDiv);
            document.body.classList.add("chats-active");
            scrollTobottom();
        }
    });
}

// Bind manual inputs to dynamic update
document.querySelectorAll(".subject-mark, #student-attendance, #student-name, #student-class").forEach(input => {
    input.addEventListener("input", updateDashboard);
});

// File input preview binding
fileinput.addEventListener("change", () => {
    const file = fileinput.files[0];
    if (!file) return;
    
    const isimage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        fileinput.value = "";
        const base64 = e.target.result.split(",")[1];
        fileupload.querySelector(".file-preview").src = e.target.result;
        fileupload.classList.add("active", isimage ? "img-attached" : "file-attached");
        userdata.file = { fillName: file.name, data: base64, mime_type: file.type, isimage };
    }
});

// Cancel attached file
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
    userdata.file = {};
    fileupload.classList.remove("active", "img-attached", "file-attached");
});

// Stop ongoing responding requests
document.querySelector("#stop-prompt-btn").addEventListener("click", () => {
    userdata.file = {};
    controller?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    chatscontainer.querySelector(".bot-message.loading")?.classList.remove("loading");
    document.body.classList.remove("bot-responding", "bot-speaking");
});

// Brand title click actions
logo.addEventListener("click", () => {
    chatbothistory.length = 0;
    chatscontainer.innerHTML = "";
    document.body.classList.remove("bot-responding", "chats-active");
});

// Delete chat button actions
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
    chatbothistory.length = 0;
    chatscontainer.innerHTML = "";
    document.body.classList.remove("bot-responding", "chats-active");
});

document.addEventListener("click", ({ target }) => {
    const wrapper = document.querySelector(".prompt-wrapper");
    const shouldhide = target.classList.contains("prompt-input") || (wrapper.classList.contains("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-prompt-btn"));
    wrapper.classList.toggle("hide-controls", shouldhide);
});

// Theme toggling actions
themetoggle.addEventListener("click", () => {
    const islighttheme = document.body.classList.toggle("light-theme");
    localStorage.setItem("themeColor", islighttheme ? "light_mode" : "dark_mode");
    themetoggle.textContent = islighttheme ? "dark_mode" : "light_mode";

    // Dynamic Chart color updates
    if (pieChart && barChart) {
        const isLight = document.body.classList.contains("light-theme");
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
});

// Load saved theme
const islighttheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", islighttheme);
themetoggle.textContent = islighttheme ? "dark_mode" : "light_mode";

// Suggestions clicking actions
document.querySelectorAll(".suggestion-lines").forEach(item => {
    item.addEventListener("click", () => {
        promptinput.value = item.querySelector(".text").textContent;
        promptform.dispatchEvent(new Event("submit"));
    })
});

promptform.addEventListener("submit", handleformSubmit);
promptform.querySelector("#add-file-btn").addEventListener("click", () => fileinput.click());

// Voice Assistant integration
const micBtn = document.querySelector("#mic-btn");
let isListening = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add("listening");
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        promptinput.value = promptinput.value ? promptinput.value + " " + transcript : transcript;
        promptinput.focus();
    };
    
    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove("listening");
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isListening = false;
        micBtn.classList.remove("listening");
    };
    
    micBtn.addEventListener("click", () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.lang = langSelector.value;
            recognition.start();
        }
    });
} else {
    micBtn.style.display = "none";
    console.warn("Speech recognition not supported in this browser.");
}

// Initialise Dashboard on startup
window.addEventListener("DOMContentLoaded", () => {
    initCharts();
    updateDashboard();
});

// Expand/Collapse Chat Panel Toggle
const expandChatBtn = document.getElementById("expand-chat-btn");
if (expandChatBtn) {
    expandChatBtn.addEventListener("click", () => {
        const dashboardGrid = document.querySelector(".dashboard-grid");
        const isExpanded = dashboardGrid.classList.toggle("chat-expanded");
        expandChatBtn.textContent = isExpanded ? "close_fullscreen" : "open_in_full";
        expandChatBtn.setAttribute("title", isExpanded ? "Exit Fullscreen" : "Toggle Fullscreen");
    });
}


// Get Started Button - Show Dashboard
// =============================
// LANDING PAGE BUTTON
// =============================

const startBtn = document.getElementById("start-btn");
const landingPage = document.getElementById("landing-page");


if(startBtn && landingPage){

const loginPage =
document.getElementById("login-page");


startBtn.addEventListener("click",()=>{


document.getElementById("landing-page")
.style.display="none";


document.getElementById("login-page")
.style.display="flex";


});

}



// =============================
// MULTI STEP FORM
// =============================


const steps = document.querySelectorAll(".step");

let currentStep = 0;



function showStep(index){


steps.forEach(step=>{

step.classList.remove("active");

});


steps[index].classList.add("active");


}




document.querySelectorAll(".next-btn")
.forEach(button=>{


button.addEventListener("click",()=>{


if(currentStep < steps.length-1){


currentStep++;

showStep(currentStep);


}


});


});





document.querySelectorAll(".back-btn")
.forEach(button=>{


button.addEventListener("click",()=>{


if(currentStep > 0){


currentStep--;

showStep(currentStep);


}


});


});






// Finish button


const finishBtn=document.querySelector(".finish-btn");


if(finishBtn){


finishBtn.addEventListener("click",async()=>{


updateDashboard();


saveStudentData();


alert("Student Profile Created Successfully 🎓");


});


}

async function saveStudentData(){


const user = auth.currentUser;


// if user is not logged in
if(!user){
    alert("Please login first");
    return;
}



await setDoc(

doc(db,"students",user.uid),


{


name:
document.querySelector("#student-name").value,


class:
document.querySelector("#student-class").value,


attendance:
document.querySelector("#student-attendance").value,


marks:{


math:
document.querySelector("#mark-math").value,


science:
document.querySelector("#mark-science").value,


english:
document.querySelector("#mark-english").value,


history:
document.querySelector("#mark-history").value,


cs:
document.querySelector("#mark-cs").value


}


}


);



console.log("Student data saved");

}




// Live manual update


document.querySelectorAll(

"#student-name,\
#student-class,\
#student-attendance,\
.subject-mark"

)
.forEach(input=>{


input.addEventListener("input",()=>{


updateDashboard();


});


});
// Brand logo click -> show landing page

const brandLogo = document.getElementById("brand-logo");


if(brandLogo){

    brandLogo.addEventListener("click",()=>{

        landingPage.style.display = "flex";

        setTimeout(()=>{

            landingPage.classList.remove("start-transition");

        },50);

    });

}


const loginBtn =
document.getElementById("login-btn");


loginBtn.addEventListener("click",async()=>{


const email =
document.getElementById("email").value;


const password =
document.getElementById("password").value;



try{


await signInWithEmailAndPassword(

auth,
email,
password

);



document.getElementById("login-page")
.style.display="none";



document.getElementById("dashboard")
.style.display="block";



// alert("Login Successful 🎓");



}

catch(error){


alert(error.message);


}



});
const signupBtn =
document.getElementById("signup-btn");


signupBtn.addEventListener("click",async()=>{


const email =
document.getElementById("email").value;


const password =
document.getElementById("password").value;



try{


await createUserWithEmailAndPassword(

auth,
email,
password

);



alert("Account Created");


}

catch(error){


alert(error.message);


}


});


