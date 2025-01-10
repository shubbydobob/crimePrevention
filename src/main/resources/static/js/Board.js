document.addEventListener("DOMContentLoaded", () => {
    // 상세 보기 버튼 클릭 이벤트 추가
    const detailButtons = document.querySelectorAll(".detail-button");
    detailButtons.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            console.log("클릭한 접수 번호:", id); // 로그 출력
            openPasswordModal(id); // 비밀번호 모달 열기
        });
    });
});

let selectedReportId = null; // 클릭한 접수 번호 저장

// 비밀번호 모달 열기
function openPasswordModal(reportId) {
    selectedReportId = reportId; // 클릭한 접수 번호 저장
    document.getElementById('password-modal').style.display = 'flex';
    console.log("비밀번호 모달 열림. 선택된 ID:", reportId); // 디버깅 로그
}

// 비밀번호 모달 닫기
function closePasswordModal() {
    selectedReportId = null;
    document.getElementById('password-modal').style.display = 'none';
    console.log("비밀번호 모달 닫힘."); // 디버깅 로그
}

// 비밀번호 확인
function validatePassword() {
    const inputPassword = document.getElementById('input-password').value;

    console.log("선택한 접수 번호 : ", selectedReportId);
    console.log("입력된 비밀번호: ", inputPassword);
    // 서버 요청: 비밀번호 확인
    fetch(`/Board/validatePassword/${selectedReportId}?password=${encodeURIComponent(inputPassword)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("비밀번호가 일치하지 않습니다.");
            }
            return response.json();
        })
        .then(data => {
            console.log("비밀번호 확인 성공. 데이터:", data); // 디버깅 로그
            closePasswordModal(); // 비밀번호 모달 닫기
            openDetailModal(data); // 상세 보기 모달 열기
        })
        .catch(error => {
            console.error("비밀번호 확인 오류:", error.message);
            alert("비밀번호가 틀렸습니다.");
        });
}

// 상세 보기 모달 열기
function openDetailModal(data) {

    console.log("받아온 데이터:", data);
    console.log("CreateDate:", data.createDate);
    console.log("FormattedDate:", data.formattedDate);

    document.getElementById('modal-id').textContent = data.id || 'N/A';
    document.getElementById('modal-reporter').textContent = data.reporter || 'N/A';
    document.getElementById('modal-phone').textContent = data.phoneNumber || 'N/A';
    document.getElementById('modal-content').textContent = data.content || 'N/A';
    document.getElementById('modal-category').textContent = data.majorCategory || 'N/A';
    document.getElementById('modal-subcategory').textContent = data.middleCategory || 'N/A';
    document.getElementById('modal-date').textContent = data.occurrenceDate || 'N/A';
    document.getElementById('modal-time').textContent = data.occurrenceTime || 'N/A';

    const fileLink = document.getElementById('modal-file');
    fileLink.textContent = data.file || 'N/A';
    fileLink.href = data.file ? `/uploads/${data.file}` : '#';

    document.getElementById('modal-createDate').textContent = data.formattedDate || 'N/A';
    document.getElementById('modal-status').textContent = data.processingStatus || 'N/A';

    document.getElementById('detail-modal').style.display = 'flex';
    console.log("상세 보기 모달 열림. 데이터:", data); // 디버깅 로그
}

// 상세 보기 모달 닫기
function closeDetailModal() {
    document.getElementById('detail-modal').style.display = 'none';
    console.log("상세 보기 모달 닫힘."); // 디버깅 로그
}