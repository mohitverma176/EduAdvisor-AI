// Load saved students if available
const savedStudents = localStorage.getItem("edu_students");
const savedWeights = localStorage.getItem("edu_subject_weights");
const savedAssignments = localStorage.getItem("edu_assignments");
const savedMarksHistory = localStorage.getItem("edu_marks_history");
const savedAttendanceHistory = localStorage.getItem("edu_attendance_history");

export const state = {
    activeStudent: null,
    students: savedStudents ? JSON.parse(savedStudents) : [],
    teacherDetails: {
        school: '',
        class: ''
    },
    subjectWeights: savedWeights ? JSON.parse(savedWeights) : {
        math: 20,
        science: 20,
        english: 20,
        history: 20,
        cs: 20
    },
    assignments: savedAssignments ? JSON.parse(savedAssignments) : [],
    marksHistory: savedMarksHistory ? JSON.parse(savedMarksHistory) : {},
    attendanceHistory: savedAttendanceHistory ? JSON.parse(savedAttendanceHistory) : {},
    notifications: [],
    activityHistory: []
};
