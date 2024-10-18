// بيانات تسجيل الدخول الأساسية
const users = {
    admin: { role: 'مدير' },
    teacher: { role: 'معلم' }
};

// بيانات الحضور
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];

// متغير لحفظ السجل المعدل
let editingRecordIndex = null;

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;

    if (users[username]) {
        toastr.success('تم تسجيل الدخول بنجاح!');
        document.getElementById('loginCard').classList.add('d-none');
        document.getElementById('addAttendanceSection').classList.remove('d-none');
        document.getElementById('searchAttendanceSection').classList.remove('d-none');
        document.getElementById('attendanceSection').classList.remove('d-none');
        loadAttendance();
    } else {
        document.getElementById('loginError').classList.remove('d-none');
        document.getElementById('loginError').textContent = 'اسم المستخدم غير صحيح.';
    }
});

// تحميل بيانات الحضور
function loadAttendance() {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    attendanceData.forEach((record, index) => {
        const row = createTableRow(record, index);
        tableBody.appendChild(row);
    });
}

// إنشاء صف في جدول الحضور
function createTableRow(record, index) {
    const row = document.createElement('tr');

    const imageCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = record.image ? record.image : 'default.jpg'; // صورة افتراضية
    img.style.width = '50px';
    img.style.height = '50px';
    imageCell.appendChild(img);
    row.appendChild(imageCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = record.name;
    row.appendChild(nameCell);

    const statusCell = document.createElement('td');
    statusCell.textContent = record.status;
    row.appendChild(statusCell);

    const dayCell = document.createElement('td');
    dayCell.textContent = record.day;
    row.appendChild(dayCell);

    const actionCell = document.createElement('td');
    actionCell.innerHTML = `
        <button class="btn btn-warning btn-sm" onclick="editRecord(${index})">تعديل</button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord(${index})">حذف</button>
    `;
    row.appendChild(actionCell);

    return row;
}

// إضافة سجل حضور جديد
document.getElementById('addAttendanceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('studentName').value;
    const day = document.getElementById('attendanceDay').value;
    const status = document.getElementById('attendanceStatus').value;
    const imageInput = document.getElementById('studentImage');
    const imageFile = imageInput.files[0];

    const reader = new FileReader();
    reader.onloadend = function() {
        const imageUrl = reader.result;

        const newRecord = {
            name,
            day,
            status,
            image: imageUrl
        };

        if (editingRecordIndex !== null) {
            attendanceData[editingRecordIndex] = newRecord;
            toastr.success('تم تعديل السجل بنجاح!');
            editingRecordIndex = null;
        } else {
            attendanceData.push(newRecord);
            toastr.success('تم إضافة سجل الحضور بنجاح!');
        }

        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        loadAttendance();
        document.getElementById('addAttendanceForm').reset();
    };
    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        const newRecord = {
            name,
            day,
            status,
            image: ''
        };
        if (editingRecordIndex !== null) {
            attendanceData[editingRecordIndex] = newRecord;
            toastr.success('تم تعديل السجل بنجاح!');
            editingRecordIndex = null;
        } else {
            attendanceData.push(newRecord);
            toastr.success('تم إضافة سجل الحضور بنجاح!');
        }
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        loadAttendance();
        document.getElementById('addAttendanceForm').reset();
    }
});

// تعديل سجل الحضور
function editRecord(index) {
    editingRecordIndex = index;
    const record = attendanceData[index];

    document.getElementById('studentName').value = record.name;
    document.getElementById('attendanceDay').value = record.day;
    document.getElementById('attendanceStatus').value = record.status;
    document.getElementById('addButton').textContent = 'تعديل الحضور';
}

// حذف سجل الحضور
function deleteRecord(index) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        attendanceData.splice(index, 1);
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        loadAttendance();
        toastr.success('تم حذف السجل بنجاح!');
    }
}

// البحث عن الحضور
function searchAttendance() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = attendanceData.filter(record => record.name.toLowerCase().includes(searchValue));
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    filteredData.forEach((record, index) => {
        const row = createTableRow(record, index);
        tableBody.appendChild(row);
    });
}

// طباعة بيانات الحضور
function printAttendance() {
    let printContent = '<h1>قائمة الحضور</h1>';
    attendanceData.forEach(record => {
        printContent += `
            <p>اسم الطالب: ${record.name}, الحالة: ${record.status}, اليوم: ${record.day}</p>
            <img src="${record.image ? record.image : 'default.jpg'}" style="width:50px;height:50px;">
        `;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>طباعة الحضور</title></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.print();
}

// عرض التقارير
function showReport() {
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = '';

    if (attendanceData.length === 0) {
        reportContent.innerHTML = '<p>لا توجد بيانات بعد.</p>';
    } else {
        attendanceData.forEach(record => {
            reportContent.innerHTML += `
                <p>اسم الطالب: ${record.name}, الحالة: ${record.status}, اليوم: ${record.day}</p>
                <img src="${record.image ? record.image : 'default.jpg'}" style="width:50px;height:50px;">
            `;
        });
    }

    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    reportModal.show();
}

// تفعيل الوضع الليلي
function toggleDarkMode() {
    document.body.classList.toggle('bg-dark');
    document.body.classList.toggle('text-light');
    document.querySelectorAll('.card').forEach(card => {
        card.classList.toggle('bg-secondary');
        card.classList.toggle('text-light');
    });
}
