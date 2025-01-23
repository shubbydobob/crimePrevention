// 전역 변수 선언
let isAdmin = false; // 관리자 여부 저장
let currentPage = 1; // 현재 페이지
const pageSize = 10; // 페이지당 표시할 데이터 개수
let selectedReportId = null; // 선택된 신고 ID 저장

// DOM이 로드된 후 실행
document.addEventListener("DOMContentLoaded", () => {
    // 관리자 여부 확인
    isAdmin = document.body.getAttribute("data-is-admin") === "true";
    console.log("[INFO] 관리자 여부:", isAdmin);

    // 관리자인 경우 로그아웃 버튼 표시
    const adminActions = document.getElementById("admin-actions");
    if (adminActions) {
        adminActions.style.display = isAdmin ? "block" : "none";
    }

    // ✅ 페이지네이션 버튼 및 상세보기 버튼 클릭 이벤트 처리 (이벤트 위임)
    document.addEventListener("click", (event) => {
        const target = event.target;

        // ✅ 페이지네이션 버튼 클릭 처리
        if (target.classList.contains("pagination-button")) {
            const page = parseInt(target.getAttribute("data-page"));
            if (!isNaN(page) && page > 0) {
                console.log(`[INFO] 페이지 버튼 클릭됨: ${page}`);
                loadPageData(page);
            }
        }

        // ✅ 상세보기 버튼 클릭 처리
        if (target.classList.contains("detail-button")) {
            const reportId = target.getAttribute("data-id");
            console.log("[INFO] 상세보기 버튼 클릭됨 - 신고 ID:", reportId);
            if (isAdmin) {
                fetchDataWithoutPassword(reportId);
            } else {
                openPasswordModal(reportId);
            }
        }
    });
});
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

// ✅ 페이지 데이터를 불러오는 함수 (수정됨)
function loadPageData(page) {
    console.log(`[INFO] 페이지 ${page} 데이터 요청 중...`);

    fetch(`/Board?page=${page}&size=${pageSize}`)
        .then(response => {
            if (!response.ok) throw new Error(`[ERROR] 서버 응답 오류: ${response.status}`);
            return response.text();
        })
        .then(html => {
            console.log(`[INFO] 페이지 ${page} 데이터 응답 완료`);

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const newBoardContainer = doc.getElementById("board-container");
            const newPaginationContainer = doc.getElementById("pagination");

            if (!newBoardContainer || !newPaginationContainer) {
                throw new Error("[ERROR] 응답에서 필요한 데이터를 찾을 수 없습니다.");
            }

            // ✅ 기존 컨테이너 내용 업데이트
            document.getElementById("board-container").innerHTML = newBoardContainer.innerHTML;
            document.getElementById("pagination").innerHTML = newPaginationContainer.innerHTML;

            // ✅ currentPage 업데이트 (Thymeleaf에서 업데이트된 값 가져오기)
            const newCurrentPage = parseInt(doc.getElementById("currentPageText")?.textContent);
            if (!isNaN(newCurrentPage)) {
                currentPage = newCurrentPage;
                console.log(`[INFO] 현재 페이지 업데이트됨: ${currentPage}`);
            }

            // ✅ totalPages 업데이트
            const newTotalPages = parseInt(doc.getElementById("totalPagesText")?.textContent);
            if (!isNaN(newTotalPages)) {
                totalPages = newTotalPages;
                console.log(`[INFO] 총 페이지 수 업데이트됨: ${totalPages}`);
            }

            console.log(`[INFO] 페이지 ${page} 데이터 업데이트 완료`);
        })
        .catch(error => console.error("[ERROR] 페이지 데이터 로드 실패:", error));
}

// 게시글 데이터를 HTML에 표시하는 함수
function displayBoardData(posts) {
    const boardContainer = document.getElementById("board-container");
    boardContainer.innerHTML = ""; // 기존 데이터 초기화

    posts.forEach(post => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${post.id}</td>
            <td>${post.reportTitle}</td>
            <td>${post.reporter}</td>
            <td>${post.formattedDate}</td>
            <td>
                <button class="detail-button" data-id="${post.id}">상세보기</button>
            </td>
        `;
        boardContainer.appendChild(row);
    });
    attachDetailEventListeners(); // 상세보기 이벤트 추가
}

function setupPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // 기존 버튼 제거

    if (totalPages <= 1) return; // 페이지가 1개 이하이면 페이징 필요 없음

    // 이전 페이지 버튼
    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "이전";
        prevButton.classList.add("pagination-button");
        prevButton.setAttribute("data-page", currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    // 페이지 번호 버튼
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("pagination-button");
        pageButton.setAttribute("data-page", i);
        if (i === currentPage) {
            pageButton.classList.add("active");
        }
        paginationContainer.appendChild(pageButton);
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "다음";
        nextButton.classList.add("pagination-button");
        nextButton.setAttribute("data-page", currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}
// 상세 보기 모달 열기
function openDetailModal(data) {

    // 콘솔 로그로 받은 데이터를 출력하여 확인
    console.log("받아온 데이터:", data); // 받은 전체 데이터
    console.log("CreateDate:", data.createDate); // 생성 날짜 확인
    console.log("FormattedDate:", data.formattedDate); // 포맷팅된 날짜 확인

    // 상세 정보를 모달에 표시 (필드마다 기본값을 'N/A'로 설정하여 데이터가 없을 경우를 대비)
    document.getElementById('modal-id').textContent = data.id || 'N/A';
    document.getElementById('modal-reporter').textContent = data.reporter || 'N/A';
    document.getElementById('modal-phone').textContent = data.phoneNumber || 'N/A';
    document.getElementById('modal-reportTitle').textContent = data.reportTitle || 'N/A';
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
        let fileUrl = data.filePath.startsWith("/uploads/") ? data.filePath : `/uploads/${data.filePath}`;

        fileLink.textContent = '파일 보기'; // 파일 링크 텍스트
        fileLink.href = fileUrl; // 파일 경로 설정
        fileThumbnail.style.display = 'block'; // 이미지 파일일 경우 썸네일 표시

        // 파일이 이미지일 경우 썸네일을 미리 보여주기
        const fileExtension = data.filePath.split('.').pop().toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension)) {
            fileThumbnail.src = fileUrl; // 썸네일 이미지 경로
            fileThumbnail.onclick = function() {
                window.open(fileUrl, '_blank'); // 썸네일 클릭 시 파일 보기
            };
        } else {
            fileThumbnail.style.display = 'none'; // 이미지가 아닐 경우 썸네일 숨기기
        }
    } else {
        fileLink.textContent = '파일 없음'; // 파일이 없을 경우 '파일 없음' 표시
        fileLink.href = '#'; // 링크 비활성화
        fileThumbnail.style.display = 'none'; // 썸네일 숨기기
    }

    // 관리자 여부에 따라 답변 영역 표시 여부 결정
    const adminReplySection = document.getElementById("admin-reply-section");
    if (isAdmin) {
        adminReplySection.style.display = "block"; // 관리자일 경우 답변 영역 표시
        adminReplySection.dataset.id = data.id; // 접수 번호 저장
        console.log("[INFO] 관리자 상태 - 답변 입력 필드 표시");
    } else {
        adminReplySection.style.display = "none"; // 일반 사용자일 경우 답변 영역 숨김
        console.log("[INFO] 일반 사용자 상태 - 답변 입력 필드 숨김");
    }
    // 답변 표시 (현재 답변 영역)
    displayReply(data);

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
    fetch("/Logout", {
            method: "GET",
            credentials: "include"
        })
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

// 답변 표시 및 버튼 상태 관리
function displayReply(data) {
    const displayReplyText = document.getElementById("display-reply-text"); // 사용자용 답변 표시 영역
    const replyText = document.getElementById("reply-text"); // 관리자용 답변 입력 필드
    const submitButton = document.getElementById("submit-reply-button");
    const editButton = document.getElementById("edit-reply-button");
    const deleteButton = document.getElementById("delete-reply-button");
    const saveButton = document.getElementById("save-reply-button");
    const cancelButton = document.getElementById("cancel-edit-button");
    const adminReplySection = document.getElementById("admin-reply-section"); // 관리자 답변 섹션

    // 사용자와 관리자 모두 볼 수 있는 현재 답변 표시
    if (data.reply) {
        displayReplyText.textContent = data.reply; // 현재 답변 내용 표시
        if (isAdmin) {
            replyText.value = data.reply; // 관리자 수정용 필드 초기화
            replyText.readOnly = false; // 항상 읽기 전용으로 초기화
        }
    } else {
        displayReplyText.textContent = "답변이 아직 등록되지 않았습니다."; // 기본 메시지
        if (isAdmin) {
            replyText.value = ""; // 관리자 수정용 필드 초기화
        }
    }

    // 관리자 전용 버튼 및 섹션 상태 관리
    if (isAdmin) {
        // 관리자일 경우만 답변 섹션 표시
        adminReplySection.style.display = "block";

        if (data.reply) {
            // 답변이 있는 경우
            submitButton.style.display = "none"; // 답변 완료 버튼 숨기기
            editButton.style.display = "inline"; // 수정 버튼 표시
            deleteButton.style.display = "inline"; // 삭제 버튼 표시
            saveButton.style.display = "none"; // 저장 버튼 숨기기
            cancelButton.style.display = "none"; // 취소 버튼 숨기기
        } else {
            // 답변이 없는 경우
            submitButton.style.display = "inline"; // 답변 완료 버튼 표시
            editButton.style.display = "none"; // 수정 버튼 숨기기
            deleteButton.style.display = "none"; // 삭제 버튼 숨기기
            saveButton.style.display = "none"; // 저장 버튼 숨기기
            cancelButton.style.display = "none"; // 취소 버튼 숨기기
        }
    } else {
        // 일반 사용자일 경우 관리자 답변 섹션 숨기기
        adminReplySection.style.display = "none";
    }
}
// 답변 제출 처리
function submitReply() {
    const replyText = document.getElementById("reply-text").value;
    const adminReplySection = document.getElementById("admin-reply-section");

    // 접수번호 확인
    const reportId = adminReplySection.dataset.id; // dataset.id에 저장된 접수번호 가져오기
    if (!reportId) {
        alert("접수번호가 유효하지 않습니다. 다시 시도하세요.");
        console.error("[ERROR] 접수번호가 설정되지 않았습니다.");
        return;
    }

    if (!replyText) {
        alert("답변 내용을 입력하세요.");
        console.error("[ERROR] 답변 내용이 비어 있습니다.");
        return;
    }

    console.log("[INFO] 답변 제출 시작 - 신고 ID:", reportId, "답변 내용:", replyText);

    fetch(`/Board/${reportId}/reply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reply: replyText
            }),
        })
        .then(response => {
            if (!response.ok) throw new Error("답변 제출 실패");
            return response.json();
        })
        .then(data => {
            console.log("[INFO] 답변 제출 성공:", data);
            alert("답변이 성공적으로 등록되었습니다.");
            document.getElementById("modal-status").textContent = "답변 완료";
            document.getElementById("reply-text").value = ""; // 입력 필드 초기화
            document.getElementById("admin-reply-section").style.display = "none";
            displayReply(data);
        })
        .catch(error => {
            console.error("[ERROR] 답변 제출 오류:", error);
            alert("답변 등록 중 오류가 발생했습니다.");
        });
}
// 답변 수정
function editReply() {
    const replyText = document.getElementById("reply-text");
    replyText.readOnly = false;
    replyText.focus(); // 입력 가능하도록 커서 포커스 설정
    document.getElementById("save-reply-button").style.display = "inline";
    document.getElementById("cancel-edit-button").style.display = "inline";
    document.getElementById("edit-reply-button").style.display = "none";
    document.getElementById("delete-reply-button").style.display = "none";
}
// 답변 저장
function saveReply() {
    const replyText = document.getElementById("reply-text").value;
    const reportId = document.getElementById("modal-id").textContent;

    fetch(`/Board/${reportId}/reply`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reply: replyText
            }),
        })
        .then(response => response.json())
        .then(data => {
            alert("답변 수정 완료!");
            displayReply(data);
        })
        .catch(error => console.error("답변 수정 오류:", error));
}

// 답변 수정 취소
function cancelEditReply() {
    const replyText = document.getElementById("reply-text");
    replyText.readOnly = true;
    displayReply({
        reply: replyText.value
    });
}

// 답변 삭제
function deleteReply() {
    const reportId = document.getElementById("modal-id").textContent;

    if (!confirm("정말로 삭제하시겠습니까?")) return;

    fetch(`/Board/${reportId}/reply`, {
            method: "DELETE"
        })
        .then(() => {
            alert("답변 삭제 완료!");
            displayReply({
                reply: ""
            });
            document.getElementById("modal-status").textContent = "처리 중";
        })
        .catch(error => console.error("답변 삭제 오류:", error));
}