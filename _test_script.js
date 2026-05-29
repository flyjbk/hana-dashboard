

const CHAT_ENABLED  = true;
const CHAT_ENDPOINT = "https://easiness-doorstop-flyer.ngrok-free.dev/chat";
const SYSTEM_PROMPT = "너는 '하나'야. 사용자의 주식/코인 투자를 돕는 AI 어시스턴트야. 친절하고 간결하게 한국어로 답해.\n\n## 현재 코인 포지션 (2026-05-30 00:59 기준)\nATOM: 35개, 매수 3164원, 현재 , -5.10%\nXRP: 35개, 매수 1946원, 현재 , +0.48%\nNEAR: 30개, 매수 3769원, 현재 , +0.16%\n\n## 코인 매매 원칙\n- 손절: 매수가 대비 -10%\n- 1차 익절: +15% (절반 매도)\n- 전량 익절: +25%\n- RSI > 72 이면 전량 매도\n\n## 오늘의 주식 추천 (score 70+)\nNHN: MODERATE, score 96, 매수가 50900원\n삼성SDI: WEAK, score 93, 매수가 688000원\nLG: WEAK, score 88, 매수가 146600원\n삼성SDS: WEAK, score 88, 매수가 299000원\n기업은행: WEAK, score 82, 매수가 20200원\n\n## 보유 주식 포트폴리오\nKODEX 200: 매수 92270원, 현재 134815원, +46.11%, 상태=매도검토\nLG에너지솔루션: 매수 432125원, 현재 457500원, +5.87%, 상태=매도검토\n기아: 매수 163575원, 현재 169500원, +3.62%, 상태=보유중\n두산에너빌리티: 매수 106014원, 현재 106800원, +0.74%, 상태=보유중\n강원랜드: 매수 15009원, 현재 15090원, +0.54%, 상태=보유중\nCJ ENM: 매수 40120원, 현재 39750원, -0.92%, 상태=손실보유\nS-Oil: 매수 108392원, 현재 106800원, -1.47%, 상태=손실보유\nKB금융: 매수 153075원, 현재 150600원, -1.62%, 상태=손실보유\n신한지주: 매수 95541원, 현재 93500원, -2.14%, 상태=손실보유\nKT: 매수 54650원, 현재 53000원, -3.02%, 상태=손실보유\n셀트리온: 매수 202988원, 현재 192800원, -5.02%, 상태=손실보유\n한화솔루션: 매수 43860원, 현재 41600원, -5.15%, 상태=손실보유\n유한양행: 매수 90071원, 현재 85100원, -5.52%, 상태=손실보유\n현대건설: 매수 159137원, 현재 146500원, -7.94%, 상태=손실보유\nHD건설기계: 매수 166535원, 현재 151100원, -9.27%, 상태=손실보유\nSK이노베이션: 매수 131836원, 현재 119300원, -9.51%, 상태=손실보유\n우리금융지주: 매수 33302원, 현재 29800원, -10.52%, 상태=손절검토\n포스코인터내셔널: 매수 72137원, 현재 64000원, -11.28%, 상태=손절검토\n기업은행: 매수 22837원, 현재 20100원, -11.98%, 상태=손절검토\n한화시스템: 매수 119832원, 현재 104700원, -12.63%, 상태=손절검토\n한국전력: 매수 44818원, 현재 38950원, -13.09%, 상태=손절검토\n알테오젠: 매수 431061원, 현재 368000원, -14.63%, 상태=손절검토\n에이비엘바이오: 매수 135745원, 현재 114500원, -15.65%, 상태=손절검토\nKODEX 인버스: 매수 1456원, 현재 1011원, -30.56%, 상태=손절검토\n\n## 주식 매매 원칙\n- Track A: +3% (5거래일) 또는 +7% (14거래일) 목표\n- Track B: +5% 또는 +10% 목표\n- 갭업 +15% 이상이면 매수 금지\n\n## 응답 규칙\n- 답변은 짧고 핵심만. 모바일에서 보기 좋게.\n- 숫자는 한국식(원, %) 단위 사용.\n- 투자 결정은 사용자 본인 판단이라고 상기시켜줘.";

let history = [];

function appendMsg(role, text) {
  const box = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = role === 'user' ? 'msg-user' : 'msg-hana';
  div.innerText = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

var _attachText = '';
var _attachName = '';

function clearAttach() {
  _attachText = ''; _attachName = '';
  document.getElementById('attach-chip').style.display = 'none';
}

document.getElementById('file-btn').addEventListener('click', function() {
  document.getElementById('file-input').click();
});

function sanitizeText(s) {
  if (!s) return '';
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c < 55296) || (c > 57343 && c <= 65535)) {
      out += s[i];
    }
  }
  return out.trim();
}

function doUpload(base64, filename, chip) {
  fetch(LOG_BASE + '/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body: JSON.stringify({ filename: filename, data: base64 })
  }).then(function(res) { return res.json(); }).then(function(data) {
    if (!data.success) {
      chip.innerHTML = '⚠️ ' + (data.error || '업로드 실패') + ' <span onclick="clearAttach()">×</span>';
      return;
    }
    _attachText = '__SERVER__';
    _attachName = data.filename;
    var info = data.truncated ? ' (앞 8000자)' : ' (' + data.chars + '자)';
    chip.innerHTML = '파일 ' + filename + info + ' <span onclick="clearAttach()">×</span>';
  }).catch(function() {
    chip.innerHTML = '⚠️ 업로드 실패 <span onclick="clearAttach()">×</span>';
  });
}

document.getElementById('file-input').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  e.target.value = '';
  var chip = document.getElementById('attach-chip');
  chip.style.display = 'flex';
  chip.innerHTML = '파일 ' + file.name + ' (업로드 중...)';
  var reader = new FileReader();
  reader.onerror = function() { chip.innerHTML = '⚠️ 파일 읽기 실패 <span onclick="clearAttach()">×</span>'; };
  reader.onload = function(ev) {
    var result = ev.target.result;
    var base64 = result.indexOf(',') >= 0 ? result.split(',')[1] : result;
    doUpload(base64, file.name, chip);
  };
  reader.readAsDataURL(file);
});

async function sendMessage() {
  if (!CHAT_ENABLED) return;
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text && !_attachText) return;
  input.value = '';
  var displayText = text || '첨부 파일을 분석해줘.';
  appendMsg('user', _attachName ? '[📎 ' + _attachName + '] ' + displayText : displayText);
  history.push({ role: 'user', content: displayText });

  var sysContent = SYSTEM_PROMPT;
  if (_attachText) { clearAttach(); }

  const btn = document.getElementById('chat-send');
  btn.disabled = true;
  btn.innerText = '...';

  var bodyStr;
  try {
    const messages = [{ role: 'system', content: sysContent }, ...history];
    bodyStr = JSON.stringify({ model: 'llama-3.1-8b-instant', messages, max_tokens: 512 });
  } catch(je) {
    appendMsg('hana', '❌ JSON직렬화오류: ' + je.message);
    btn.disabled = false; btn.innerText = '전송'; return;
  }
  try {
    var bodyBlob = new Blob([bodyStr], { type: 'application/json; charset=utf-8' });
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      body: bodyBlob
    });
    const data  = await res.json();
    const reply = data?.choices?.[0]?.message?.content || '⚠️ 응답 없음';
    history.push({ role: 'assistant', content: reply });
    appendMsg('hana', reply);
  } catch(e) {
    appendMsg('hana', '❌ fetch오류: ' + e.message);
  }

  btn.disabled = false;
  btn.innerText = '전송';
}

document.getElementById('chat-send').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

document.getElementById('chat-save').addEventListener('click', () => {
  if (history.length === 0) {
    alert('저장할 대화가 없습니다.');
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const lines = history.map(m =>
    '[' + (m.role === 'user' ? '나' : '하나') + '] ' + m.content
  ).join('\n\n');
  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'hana_chat_' + date + '.txt';
  a.click();
  URL.revokeObjectURL(url);
});

if (!CHAT_ENABLED) {
  document.getElementById('chat-input').disabled = true;
  document.getElementById('chat-send').disabled  = true;
}

// ── 대화 기록 / 영구 보존 ──────────────────────────────────────
const LOG_BASE = CHAT_ENDPOINT.replace('/chat', '');

async function loadLogs() {
  const date = document.getElementById('log-date').value;
  const list = document.getElementById('log-list');
  if (!date || !CHAT_ENABLED) { list.innerHTML = "<div class='empty-msg'>채팅 서버 미연결</div>"; return; }
  list.innerHTML = "<div class='empty-msg'>로딩 중...</div>";
  try {
    const res  = await fetch(LOG_BASE + '/logs?date=' + date, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    const data = await res.json();
    if (!data.length) { list.innerHTML = "<div class='empty-msg'>해당 날짜 대화 없음</div>"; return; }
    list.innerHTML = data.map(function(e) {
      return '<div class="log-entry">' +
        '<div class="log-time">' + e.time + '</div>' +
        '<div class="log-q">나: ' + e.user + '</div>' +
        '<div class="log-a">하나: ' + e.assistant + '</div>' +
        '</div>';
    }).join('');
  } catch(err) {
    list.innerHTML = "<div class='empty-msg'>로드 실패 (서버 꺼짐?)</div>";
  }
}

async function loadPermanent() {
  const list = document.getElementById('perm-list');
  if (!CHAT_ENABLED) { list.innerHTML = "<div class='empty-msg'>채팅 서버 미연결</div>"; return; }
  try {
    const res  = await fetch(LOG_BASE + '/logs/permanent', { headers: { 'ngrok-skip-browser-warning': 'true' } });
    const data = await res.json();
    if (!data.length) { list.innerHTML = "<div class='empty-msg'>영구 보존 메모 없음<br><small style='color:#334155'>대화 중 '기억해줘'라고 하면 저장됩니다</small></div>"; return; }
    list.innerHTML = data.slice().reverse().map(function(e) {
      return '<div class="perm-entry">' +
        '<div class="perm-date">' + e.date + ' ' + e.time + '</div>' +
        '<div class="perm-q">나: ' + e.user + '</div>' +
        '<div class="perm-a">하나: ' + e.assistant + '</div>' +
        '</div>';
    }).join('');
  } catch(err) {
    list.innerHTML = "<div class='empty-msg'>로드 실패 (서버 꺼짐?)</div>";
  }
}

window.addEventListener('load', () => {
  loadLogs();
  loadPermanent();
});

