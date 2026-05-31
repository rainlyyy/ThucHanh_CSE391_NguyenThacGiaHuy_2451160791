const STORAGE_KEY = 'students_btth03';

let students = [];
let editIndex = -1;

// ===== DOM Elements =====
const tableBody      = document.getElementById('student-table-body');
const modalOverlay   = document.getElementById('modal-overlay');
const modalTitle     = document.getElementById('modal-title');
const btnOpenModal   = document.getElementById('btn-open-modal');
const btnCloseModal  = document.getElementById('btn-close-modal');
const btnCancel      = document.getElementById('btn-cancel');
const btnSubmit      = document.getElementById('btn-submit');
const notification   = document.getElementById('notification');

// Form inputs
const inputMsv      = document.getElementById('msv');
const inputHoten    = document.getElementById('hoten');
const inputNgaysinh = document.getElementById('ngaysinh');
const inputLophoc   = document.getElementById('lophoc');
const inputDiemtb   = document.getElementById('diemtb');
const inputEmail    = document.getElementById('email');

// ===== LocalStorage =====
function loadStudents() {
  try {
    students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    students = [];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ===== Render =====
function renderStudents() {
  if (students.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">📭 Chưa có sinh viên nào. Hãy thêm mới!</td>
      </tr>`;
  } else {
    tableBody.innerHTML = students.map((sv, i) => {
      const gpa = parseFloat(sv.diemtb);
      const gpaCls = gpa >= 8.5 ? 'gpa-high' : gpa >= 6.5 ? 'gpa-mid' : 'gpa-low';
      const dob = sv.ngaysinh
        ? new Date(sv.ngaysinh).toLocaleDateString('vi-VN')
        : '—';

      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${sv.msv}</strong></td>
          <td>${sv.hoten}</td>
          <td>${dob}</td>
          <td>${sv.lophoc}</td>
          <td><span class="gpa ${gpaCls}">${parseFloat(sv.diemtb).toFixed(2)}</span></td>
          <td>${sv.email}</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-sm btn-edit"   data-index="${i}">✏️ Sửa</button>
              <button class="btn btn-sm btn-delete" data-index="${i}">🗑️ Xóa</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  updateStatistics();
}

function updateStatistics() {
  document.getElementById('total-students').textContent = students.length;

  if (students.length === 0) {
    document.getElementById('avg-gpa').textContent = '0.00';
    document.getElementById('excellent-count').textContent = '0';
  } else {
    const avg = students.reduce((sum, sv) => sum + parseFloat(sv.diemtb || 0), 0) / students.length;
    document.getElementById('avg-gpa').textContent = avg.toFixed(2);
    document.getElementById('excellent-count').textContent =
      students.filter(sv => parseFloat(sv.diemtb) >= 8.5).length;
  }
}

// ===== Modal =====
function openModal() {
  modalOverlay.classList.add('open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
  resetForm();
  editIndex = -1;
}

function resetForm() {
  inputMsv.value      = '';
  inputHoten.value    = '';
  inputNgaysinh.value = '';
  inputLophoc.value   = '';
  inputDiemtb.value   = '';
  inputEmail.value    = '';

  ['msv', 'hoten', 'lophoc', 'diemtb', 'email'].forEach(id => {
    const el = document.getElementById('err-' + id);
    if (el) el.textContent = '';
  });
}

// ===== Validation =====
function validate() {
  let valid = true;

  // Trường văn bản bắt buộc
  [
    { id: 'msv',    label: 'Mã sinh viên' },
    { id: 'hoten',  label: 'Họ và tên' },
    { id: 'lophoc', label: 'Lớp học' },
  ].forEach(({ id, label }) => {
    const val = document.getElementById(id).value.trim();
    const err = document.getElementById('err-' + id);
    if (!val) {
      err.textContent = `${label} không được để trống.`;
      valid = false;
    } else {
      err.textContent = '';
    }
  });

  // Email
  const email    = inputEmail.value.trim();
  const errEmail = document.getElementById('err-email');
  if (!email) {
    errEmail.textContent = 'Email không được để trống.';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEmail.textContent = 'Email không đúng định dạng.';
    valid = false;
  } else {
    errEmail.textContent = '';
  }

  // Điểm trung bình
  const diem    = parseFloat(inputDiemtb.value);
  const errDiem = document.getElementById('err-diemtb');
  if (isNaN(diem) || diem < 0 || diem > 10) {
    errDiem.textContent = 'Điểm TB phải là số từ 0 đến 10.';
    valid = false;
  } else {
    errDiem.textContent = '';
  }

  return valid;
}

// ===== Submit Form =====
function submitForm() {
  if (!validate()) return;

  const sv = {
    msv:      inputMsv.value.trim(),
    hoten:    inputHoten.value.trim(),
    ngaysinh: inputNgaysinh.value,
    lophoc:   inputLophoc.value.trim(),
    diemtb:   parseFloat(inputDiemtb.value).toFixed(2),
    email:    inputEmail.value.trim(),
  };

  if (editIndex === -1) {
    students.push(sv);
    showNotification('✅ Thêm sinh viên thành công!', 'success');
  } else {
    students[editIndex] = sv;
    showNotification('✅ Cập nhật sinh viên thành công!', 'success');
  }

  saveStudents();
  renderStudents();
  closeModal();
}

// ===== Edit =====
function editStudent(i) {
  editIndex = i;
  const sv = students[i];

  inputMsv.value      = sv.msv;
  inputHoten.value    = sv.hoten;
  inputNgaysinh.value = sv.ngaysinh;
  inputLophoc.value   = sv.lophoc;
  inputDiemtb.value   = sv.diemtb;
  inputEmail.value    = sv.email;

  modalTitle.textContent    = 'Cập nhật sinh viên';
  btnSubmit.textContent     = '💾 Cập nhật';
  openModal();
}

// ===== Delete =====
function deleteStudent(i) {
  const sv = students[i];
  if (confirm(`Bạn có chắc muốn xóa sinh viên "${sv.hoten}" không?`)) {
    students.splice(i, 1);
    saveStudents();
    renderStudents();
    showNotification('🗑️ Đã xóa sinh viên thành công!', 'success');
  }
}

// ===== Notification =====
function showNotification(msg, type = 'success') {
  notification.textContent = msg;
  notification.className   = type;
  notification.style.display = 'block';
  setTimeout(() => { notification.style.display = 'none'; }, 3000);
}

// ===== Event Listeners =====
btnOpenModal.addEventListener('click', () => {
  modalTitle.textContent = 'Thêm sinh viên mới';
  btnSubmit.textContent  = '💾 Lưu';
  editIndex = -1;
  openModal();
});

btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
btnSubmit.addEventListener('click', submitForm);

// Đóng modal khi click vào backdrop
modalOverlay.addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Event delegation cho nút Sửa / Xóa trong bảng
tableBody.addEventListener('click', function (e) {
  const btn   = e.target.closest('button');
  if (!btn) return;
  const index = parseInt(btn.dataset.index);

  if (btn.classList.contains('btn-edit'))   editStudent(index);
  if (btn.classList.contains('btn-delete')) deleteStudent(index);
});

// ===== Dữ liệu mẫu =====
const SAMPLE_STUDENTS = [
  { msv: 'SV001', hoten: 'Nguyễn Văn An',    ngaysinh: '2004-03-15', lophoc: 'K66A', diemtb: '9.20', email: 'annv@example.com' },
  { msv: 'SV002', hoten: 'Trần Thị Bình',    ngaysinh: '2004-07-22', lophoc: 'K66A', diemtb: '7.85', email: 'binht@example.com' },
  { msv: 'SV003', hoten: 'Lê Hoàng Minh',    ngaysinh: '2003-11-08', lophoc: 'K66B', diemtb: '6.40', email: 'minhlh@example.com' },
  { msv: 'SV004', hoten: 'Phạm Ngọc Hà',     ngaysinh: '2004-01-30', lophoc: 'K66B', diemtb: '8.75', email: 'hapn@example.com' },
  { msv: 'SV005', hoten: 'Đỗ Quang Trường',  ngaysinh: '2003-09-12', lophoc: 'K66C', diemtb: '5.60', email: 'truongdq@example.com' },
];

// ===== Init =====
loadStudents();
if (students.length === 0) {
  students = SAMPLE_STUDENTS;
  saveStudents();
}
renderStudents();