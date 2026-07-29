import { state } from "./state.js";

export function initParentComms() {

    const select = document.getElementById("parent-student-select");

    if (!select) return;

    select.innerHTML = "";

    if (state.students.length === 0) {

        const option = document.createElement("option");
        option.textContent = "No students available";
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);

        return;
    }

    state.students.forEach(student => {

        const option = document.createElement("option");

        option.value = student.login || student.email || student.name;
        option.textContent = student.name;

        select.appendChild(option);
    });

    const sendBtn = document.getElementById("send-parent-email-btn");

    if (sendBtn) {

        sendBtn.onclick = function () {

            const selectedStudent =
                state.students.find(s =>
                    (s.login || s.email || s.name) === select.value
                );

            const parentEmail =
                document.getElementById("parent-email").value;

            if (!selectedStudent) {
                alert("Please select a student.");
                return;
            }

            if (!parentEmail) {
                alert("Please enter parent email.");
                return;
            }

            const subject = encodeURIComponent("Student Login Details");

            const body = encodeURIComponent(
`Student Name: ${selectedStudent.name}

Login: ${selectedStudent.login || selectedStudent.email}

Password: ${selectedStudent.password}`
            );

            window.location.href =
                `mailto:${parentEmail}?subject=${subject}&body=${body}`;
        };
    }
}