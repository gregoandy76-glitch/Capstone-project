// Scroll reveal
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
}

let myChart;
let pageHistory = ['home'];
const pageTitles = { home: 'Beranda', scan: 'Upload & Scan', dashboard: 'Dashboard' };

function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (!user) return alert("Isi username dulu!");
    if (!pass) return alert("Isi password dulu!");
    document.getElementById('home-user-display').innerText = user;
    document.getElementById('user-display').innerText = user;
    document.getElementById('user-avatar').innerText = user.charAt(0).toUpperCase();
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    pageHistory = ['home'];
    updateTopbar();
    initChart();
}

function togglePassword() {
    const input = document.getElementById('password');
    const btn = document.querySelector('.toggle-pw');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

function logout() {
    if (!confirm('Yakin ingin keluar?')) return;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password').type = 'password';
    document.querySelector('.toggle-pw').textContent = '👁';
    pageHistory = ['home'];
    // reset upload state
    clearFile({ stopPropagation: () => {} });
    clearCamera({ stopPropagation: () => {} });
    document.getElementById('detail-screen').classList.add('hidden');
    document.getElementById('upload-screen').classList.remove('hidden');
    document.getElementById('prod-name-input').value = '';
    // scroll landing page ke atas
    document.getElementById('login-page').scrollTop = 0;
    window.scrollTo(0, 0);
}

function showPage(pageId, element) {
    const current = pageHistory[pageHistory.length - 1];
    if (current !== pageId) pageHistory.push(pageId);
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    element.classList.add('active');
    updateTopbar();
    closeSidebar();
}

function goBack() {
    if (pageHistory.length <= 1) return;
    pageHistory.pop();
    const prev = pageHistory[pageHistory.length - 1];
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(prev).classList.remove('hidden');
    const navItems = document.querySelectorAll('.nav-item');
    const idx = ['home','scan','dashboard'].indexOf(prev);
    navItems.forEach(n => n.classList.remove('active'));
    if (idx >= 0) navItems[idx].classList.add('active');
    updateTopbar();
}

function updateTopbar() {
    const current = pageHistory[pageHistory.length - 1];
    document.getElementById('topbar-title').innerText = pageTitles[current] || '';
    document.getElementById('back-btn').style.visibility = pageHistory.length > 1 ? 'visible' : 'hidden';
}

async function startCamera() {
    const video = document.getElementById('webcam');
    const text = document.getElementById('cam-text');
    const clearBtn = document.getElementById('cam-clear');
    if (video.srcObject) return; // sudah aktif
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.classList.remove('hidden');
        text.classList.add('hidden');
        clearBtn.classList.remove('hidden');
        document.getElementById('cam-box').onclick = null;
    } catch (e) { alert("Kamera tidak dapat diakses."); }
}

function clearCamera(e) {
    e.stopPropagation();
    const video = document.getElementById('webcam');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }
    video.classList.add('hidden');
    document.getElementById('cam-text').classList.remove('hidden');
    document.getElementById('cam-clear').classList.add('hidden');
    document.getElementById('cam-box').onclick = startCamera;
}

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('file-preview');
    const display = document.getElementById('file-display');
    const clearBtn = document.getElementById('file-clear');
    const icon = document.getElementById('file-icon');

    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        icon.classList.add('hidden');
        display.innerText = file.name;
        clearBtn.classList.remove('hidden');
        document.getElementById('file-box').onclick = null;
    };
    reader.readAsDataURL(file);
}

function clearFile(e) {
    e.stopPropagation();
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('file-preview').src = '';
    document.getElementById('file-icon').classList.remove('hidden');
    document.getElementById('file-display').innerText = 'Pilih dari Galeri';
    document.getElementById('file-clear').classList.add('hidden');
    document.getElementById('file-box').onclick = () => document.getElementById('file-input').click();
}

function analyzeProduct() {
    const name = document.getElementById('prod-name-input').value;
    if (!name) return alert("Tolong masukkan nama produk!");

    document.getElementById('final-prod-name').innerText = name;
    document.getElementById('upload-screen').classList.add('hidden');
    document.getElementById('detail-screen').classList.remove('hidden');
}

function resetUpload() {
    document.getElementById('detail-screen').classList.add('hidden');
    document.getElementById('upload-screen').classList.remove('hidden');
}

function saveAndGo() {
    const name = document.getElementById('final-prod-name').innerText;
    const tableBody = document.querySelector('#history-table tbody');
    const time = new Date().getHours() + ":" + (new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes();

    const row = `<tr>
        <td>${time}</td>
        <td>${name}</td>
        <td style="color:#ef4444; font-weight:bold">35g</td>
        <td style="color:#3b82f6; font-weight:bold">400mg</td>
    </tr>`;

    tableBody.insertAdjacentHTML('afterbegin', row);
    alert("Berhasil disimpan!");
    showPage('dashboard', document.querySelectorAll('.nav-item')[2]);
}

function initChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Gula', 'Garam', 'Sisa'],
            datasets: [{
                data: [70, 20, 10],
                backgroundColor: ['#ef4444', '#3b82f6', '#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '85%',
            plugins: { legend: { display: false } }
        }
    });
}