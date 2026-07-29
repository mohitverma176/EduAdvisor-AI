import { state } from './state.js';

export const chatbothistory = [];

let controller;

// Helper to create message elements
export const createmsgelement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const parseResponseToHTML = (text) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

export const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const cleanText = text.replace(/[#*]/g, '').replace(/_/g, ' ').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => { document.body.classList.add("bot-speaking"); };
        utterance.onend = () => { document.body.classList.remove("bot-speaking"); };
        utterance.onerror = () => { document.body.classList.remove("bot-speaking"); };
        
        window.speechSynthesis.speak(utterance);
    }
};

const renderStructuredResponse = (text, textelement, botmsgdiv) => {
    botmsgdiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    
    textelement.innerHTML = parseResponseToHTML(text);
    textelement.classList.add("fade-in-content");
    
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
    const promptinput = document.querySelector(".prompt-input");
    const promptform = document.querySelector(".prompt-form");
    
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            promptinput.value = btn.getAttribute("data-prompt");
            promptform.dispatchEvent(new Event("submit"));
        });
    });
    
    document.querySelector(".chat-inner-container").scrollTo({ top: document.querySelector(".chat-inner-container").scrollHeight, behavior: "smooth" });
}

export const generateresponse = async (botmsgdiv, langData, langValue, usermessage) => {
    const textelement = botmsgdiv.querySelector(".message-text");
    controller = new AbortController();

    const student = state.activeStudent || {};
    const avgScore = document.getElementById("val-gpa")?.textContent || "N/A";
    const riskLevel = document.getElementById("val-risk")?.textContent || "N/A";
    const attStatus = document.getElementById("badge-attendance")?.textContent || "N/A";

    const advisorContext = `You are an encouraging, professional Academic Advisor and Student Counselor.
Here is the live academic profile of the student you are advising:
- Student Name: ${student.name || 'Unknown'}
- Class/Grade: ${state.teacherDetails.class || 'Unknown'}
- Attendance Rate: ${student.attendance || 0}% (Status: ${attStatus})
- Mathematics Score: ${student.marks?.math || 0}/100
- Science Score: ${student.marks?.science || 0}/100
- English Score: ${student.marks?.english || 0}/100
- History Score: ${student.marks?.history || 0}/100
- Computer Science Score: ${student.marks?.cs || 0}/100
- Overall Average Grade: ${avgScore}
- Academic Risk Status: ${riskLevel}

Provide helpful, empathetic, and actionable guidance based on these metrics. Suggest ways to address weaknesses and build on strengths.
Format your response clearly. Use '## ' (e.g. ## Strengths & Weaknesses) for major sections so I can create accordions. Ensure all bold text uses markdown **bold**. ${langData.sysprompt}
User Query: ${usermessage}`;

    chatbothistory.push({
        role: "user",
        parts: [{ text: advisorContext }]
    });

    try {
        let response;
        for(let i = 0; i < 3; i++) {
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
            if(response.status !== 503) break;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

       const data = await response.json();

console.log("Backend Response:", data);

if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Gemini API Error");
}

const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!responseText) {
    console.error("Unexpected Gemini Response:", data);
    throw new Error("Gemini did not return any text.");
}
if (!responseText) {
    console.error("Unexpected API Response:", data);
    throw new Error("Gemini returned an invalid response.");
}
        renderStructuredResponse(responseText, textelement, botmsgdiv);
        
        speakText(responseText, langValue);

        chatbothistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });
    } catch (error) {
        textelement.style.color = "#ef4444";
        textelement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        botmsgdiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
    }
}

export const stopChatbot = () => {
    controller?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
