let isAdmin = false; // 전역 변수로 선언, 모든 함수에 접근 가능

document.addEventListener("DOMContentLoaded", () => {
     isAdmin = document.body.getAttribute("data-is-admin") === "true"; // 관리자 여부 확인
     console.log("관리자 여부:", isAdmin); // 디버깅용 로그


    // 로그아웃 버튼 표시/숨기기
    const adminActions = document.getElementById("admin-actions");
    if (isAdmin) {
        adminActions.style.display = "block"; // 관리자일 경우 로그아웃 버튼 표시
        console.log("관리자 로그인 상태: 로그아웃 버튼 표시");
    } else {
        adminActions.style.display = "none"; // 일반 사용자일 경우 로그아웃 버튼 숨기기
        console.log("일반 사용자 상태: 로그아웃 버튼 숨김");
    }

    // 상세 보기 버튼 클릭 이벤트 추가
    const detailButtons = document.querySelectorAll(".detail-button");
    detailButtons.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            console.log("클릭한 접수 번호:", id); // 로그 출력
            if (isAdmin) {
                 console.log("관리자로 확인됨. 비밀번호 없이 데이터 요청.");
                 fetchDataWithoutPassword(id); // 관리자일 경우 바로 데이터 요청
            } else {
                 console.log("일반 사용자 접근. 비밀번호 모달 열림.");
                 openPasswordModal(id); // 일반 사용자는 비밀번호 모달 열기
            }
        });
    });
});

let selectedReportId = null; // 클릭한 접수 번호 저장

// 비밀번호 모달 열기
function openPasswordModal(reportId) {
    // 관리자 여부 확인 (HTML의 data-is-admin 속성 이용)
    selectedReportId = reportId; // 클릭한 접수 번호 저장

    if (isAdmin) {
            console.log("[INFO] 관리자 확인됨. 비밀번호 모달 없이 데이터 요청.");
            fetchDataWithoutPassword(reportId);
        } else {
            console.log("[INFO] 일반 사용자 접근. 비밀번호 모달 열림." + reportId);
            document.getElementById('password-modal').style.display = 'flex';
        }
    }

// 관리자 : 비밀번호 없이 데이터 요청
function fetchDataWithoutPassword(reportId) {
    fetch(`/Board/validatePassword/${reportId}`, {
        method: "GET",
        credentials: "include", // 세션 정보 포함
    })
        .then(response => {
            if (!response.ok) throw new Error("관리자 데이터 요청 실패.");
            return response.json();
        })
        .then(data => {
            console.log("관리자 데이터 요청 성공:", data);
            openDetailModal(data); // 상세정보 표시
        })
        .catch(error => console.error("데이터 요청 오류:", error));
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

    // 콘솔 로그로 받은 데이터를 출력하여 확인
    console.log("받아온 데이터:", data);  // 받은 전체 데이터
    console.log("CreateDate:", data.createDate);  // 생성 날짜 확인
    console.log("FormattedDate:", data.formattedDate);  // 포맷팅된 날짜 확인

    // 상세 정보를 모달에 표시 (필드마다 기본값을 'N/A'로 설정하여 데이터가 없을 경우를 대비)
    document.getElementById('modal-id').textContent = data.id || 'N/A';
    document.getElementById('modal-reporter').textContent = data.reporter || 'N/A';
    document.getElementById('modal-phone').textContent = data.phoneNumber || 'N/A';
    document.getElementById('modal-content').textContent = data.content || 'N/A';
    document.getElementById('modal-category').textContent = data.majorCategory || 'N/A';
    document.getElementById('modal-subcategory').textContent = data.middleCategory || 'N/A';
    document.getElementById('modal-date').textContent = data.occurrenceDate || 'N/A';
    document.getElementById('modal-time').textContent = data.occurrenceTime || 'N/A';
    document.getElementById('modal-createDate').textContent = data.formattedDate || 'N/A';
    document.getElementById('modal-status').textContent = data.processingStatus || 'N/A';

    // 파일 관련 정보
    const fileLink = document.getElementById('modal-file');
    const fileContainer = document.getElementById("modal-file-container");
    const fileThumbnail = document.getElementById("modal-thumbnail");

    // 파일 링크를 설정
        if (data.filePath) {
            fileLink.textContent = '파일 보기';  // 파일 링크 텍스트
            fileLink.href = `src/main/resources/static/uploads/${data.filePath}`;  // 파일 경로 설정
            fileThumbnail.style.display = 'block';  // 이미지 파일일 경우 썸네일 표시

            // 파일이 이미지일 경우 썸네일을 미리 보여주기
            const fileExtension = data.filePath.split('.').pop().toLowerCase();
            if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension)) {
                fileThumbnail.src = `src/main/resources/static/uploads/${data.filePath}`;  // 썸네일 이미지 경로
                fileThumbnail.onclick = function () {
                    window.open(fileLink.href, '_blank');  // 썸네일 클릭 시 파일 보기
                };
            } else {
                fileThumbnail.style.display = 'none';  // 이미지가 아닐 경우 썸네일 숨기기
            }
        } else {
            fileLink.textContent = '파일 없음';  // 파일이 없을 경우 '파일 없음' 표시
            fileLink.href = '#';  // 링크 비활성화
            fileThumbnail.style.display = 'none';  // 썸네일 숨기기
        }
    document.getElementById('detail-modal').style.display = 'flex';
    console.log("상세 보기 모달 열림. 데이터:", data); // 디버깅 로그
}

// 상세 보기 모달 닫기
function closeDetailModal() {
    document.getElementById('detail-modal').style.display = 'none';
    console.log("상세 보기 모달 닫힘."); // 디버깅 로그
}

// 로그아웃 함수
    function logout() {
        fetch("/Logout", { method: "GET", credentials: "include" })
            .then(response => {
                if (response.ok) {
                    console.log("로그아웃 성공");
                    document.body.setAttribute("data-is-admin", "false"); // 관리자 상태 초기화
                    window.location.href = "/Admin"; // 로그인 페이지로 이동
                } else {
                    console.error("로그아웃 실패");
                }
            })
            .catch(error => console.error("로그아웃 요청 오류:", error));
    }