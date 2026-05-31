const STORAGE_KEY = 'tasks_btth03';

let tasks     = [];
let editIndex = -1;

// ===== Ánh xạ ưu tiên =====
const PRIO_CLASS = { high: 'prio-high', mid: 'prio-mid', low: 'prio-low' };
const PRIO_LABEL = { high: '🔴 Cao',    mid: '🟡 Trung bình', low: '🟢 Thấp' };

// ===== DOM Elements =====
const taskList      = document.getElementById('task-list');
const modalOverlay  = document.getElementById('modal-overlay');
const modalTitle    = document.getElementById('modal-title');
const btnOpenModal  = document.getElementById('btn-open-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel     = document.getElementById('btn-cancel');
const btnSubmit     = document.getElementById('btn-submit');
const notification  = document.getElementById('notification');

// Form inputs
const inputTieude = document.getElementById('tieude');
const inputMota   = document.getElementById('mota');
const inputHanht  = document.getElementById('hanht');
const inputUutien = document.getElementById('uutien');

// ===== LocalStorage =====
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ===== Render =====
function renderTasks() {
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="big">📭</div>
        <p>Chưa có công việc nào. Hãy thêm mới!</p>
      </div>`;
  } else {
    taskList.innerHTML = tasks.map((t, i) => {
      const dueStr = t.hanht
        ? new Date(t.hanht).toLocaleDateString('vi-VN')
        : '';

      return `
        <div class="task-card ${t.done ? 'done-card' : ''}">
          <input
            type="checkbox"
            class="task-checkbox"
            ${t.done ? 'checked' : ''}
            data-index="${i}"
          >
          <div class="task-body">
            <div class="task-title">${t.tieude}</div>
            ${t.mota ? `<div class="task-desc">${t.mota}</div>` : ''}
            <div class="task-meta">
              <span class="prio-badge ${PRIO_CLASS[t.uutien]}">${PRIO_LABEL[t.uutien]}</span>
              ${dueStr ? `<span class="due-date">📅 ${dueStr}</span>` : ''}
              ${t.done ? `<span class="prio-badge prio-low">✔ Hoàn thành</span>` : ''}
            </div>
          </div>
          <div class="task-actions">
            <button class="btn btn-sm btn-edit"   data-index="${i}">✏️</button>
            <button class="btn btn-sm btn-delete" data-index="${i}">🗑️</button>
          </div>
        </div>`;
    }).join('');
  }

  updateTaskSummary();
}

function updateTaskSummary() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;

  document.getElementById('total-tasks').textContent   = total;
  document.getElementById('done-tasks').textContent    = done;
  document.getElementById('pending-tasks').textContent = pending;
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
  inputTieude.value = '';
  inputMota.value   = '';
  inputHanht.value  = '';
  inputUutien.value = 'mid';

  document.getElementById('err-tieude').textContent = '';
  document.getElementById('err-hanht').textContent  = '';
}

// ===== Validation =====
function validate() {
  let valid = true;

  const tieude    = inputTieude.value.trim();
  const errTieude = document.getElementById('err-tieude');
  if (!tieude) {
    errTieude.textContent = 'Tiêu đề không được để trống.';
    valid = false;
  } else {
    errTieude.textContent = '';
  }

  const hanht    = inputHanht.value;
  const errHanht = document.getElementById('err-hanht');
  if (!hanht) {
    errHanht.textContent = 'Hạn hoàn thành không được để trống.';
    valid = false;
  } else {
    errHanht.textContent = '';
  }

  return valid;
}

// ===== Submit Form =====
function submitForm() {
  if (!validate()) return;

  const task = {
    tieude: inputTieude.value.trim(),
    mota:   inputMota.value.trim(),
    hanht:  inputHanht.value,
    uutien: inputUutien.value,
    done:   false,
  };

  if (editIndex === -1) {
    tasks.push(task);
    showMessage('✅ Thêm công việc thành công!', 'success');
  } else {
    task.done        = tasks[editIndex].done; // giữ trạng thái hoàn thành khi sửa
    tasks[editIndex] = task;
    showMessage('✅ Cập nhật công việc thành công!', 'success');
  }

  saveTasks();
  renderTasks();
  closeModal();
}

// ===== Toggle Done =====
function toggleDone(i) {
  tasks[i].done = !tasks[i].done;
  saveTasks();
  renderTasks();
  showMessage(
    tasks[i].done ? '🎉 Đã đánh dấu hoàn thành!' : 'ℹ️ Đánh dấu chưa hoàn thành.',
    'success'
  );
}

// ===== Edit =====
function editTask(i) {
  editIndex = i;
  const t   = tasks[i];

  inputTieude.value = t.tieude;
  inputMota.value   = t.mota;
  inputHanht.value  = t.hanht;
  inputUutien.value = t.uutien;

  modalTitle.textContent = 'Cập nhật công việc';
  btnSubmit.textContent  = '💾 Cập nhật';
  openModal();
}

// ===== Delete =====
function deleteTask(i) {
  if (confirm(`Bạn có chắc muốn xóa công việc "${tasks[i].tieude}" không?`)) {
    tasks.splice(i, 1);
    saveTasks();
    renderTasks();
    showMessage('🗑️ Đã xóa công việc!', 'success');
  }
}

// ===== Notification =====
function showMessage(msg, type = 'success') {
  notification.textContent   = msg;
  notification.className     = type;
  notification.style.display = 'block';
  setTimeout(() => { notification.style.display = 'none'; }, 2800);
}

// ===== Event Listeners =====
btnOpenModal.addEventListener('click', () => {
  modalTitle.textContent = 'Thêm công việc mới';
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

// Event delegation cho toàn bộ danh sách task
taskList.addEventListener('click', function (e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const i = parseInt(btn.dataset.index);
  if (btn.classList.contains('btn-edit'))   editTask(i);
  if (btn.classList.contains('btn-delete')) deleteTask(i);
});

taskList.addEventListener('change', function (e) {
  const checkbox = e.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  toggleDone(parseInt(checkbox.dataset.index));
});

// ===== Dữ liệu mẫu =====
const SAMPLE_TASKS = [
  { tieude: 'Hoàn thành bài tập lớn môn Mạng máy tính', mota: 'Làm báo cáo và slide thuyết trình', hanht: '2025-06-10', uutien: 'high', done: false },
  { tieude: 'Ôn tập giữa kỳ môn Cơ sở dữ liệu',        mota: 'Tập trung vào chuẩn hóa và SQL nâng cao', hanht: '2025-06-05', uutien: 'high', done: false },
  { tieude: 'Đọc tài liệu về DOM và Event',             mota: 'Xem lại slide BTTH03 và thực hành thêm', hanht: '2025-06-03', uutien: 'mid',  done: true  },
  { tieude: 'Nộp đăng ký đề tài khóa luận',             mota: 'Điền form và gửi email cho giáo viên hướng dẫn', hanht: '2025-06-15', uutien: 'mid', done: false },
  { tieude: 'Dọn dẹp phòng trọ cuối tuần',              mota: '',                                        hanht: '2025-06-08', uutien: 'low',  done: false },
];

// ===== Init =====
loadTasks();
if (tasks.length === 0) {
  tasks = SAMPLE_TASKS;
  saveTasks();
}
renderTasks();