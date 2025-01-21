// ✅ 네이버 본인인증 시작 (로그인 버튼 클릭 시 실행)
function startNaverAuth() {
    console.log("[INFO] 네이버 본인인증 요청 시작");

    fetch("/api/naver/auth/start")
        .then(response => response.json())
        .then(data => {
            console.log("[INFO] 네이버 로그인 페이지로 이동:", data.url);
            let authWindow = window.open(data.url, "네이버 본인인증", "width=600,height=800");

            if (!authWindow) {
                console.error("[ERROR] 팝업 창을 열 수 없습니다. 팝업 차단을 해제하세요.");
                alert("팝업 차단을 해제해주세요.");
                return;
            }

            // ✅ 팝업 창 닫힘 감지
            let checkPopup = setInterval(() => {
                if (!authWindow || authWindow.closed) {
                    clearInterval(checkPopup);
                    console.log("[INFO] 본인인증 창이 닫힘 - 사용자 정보 업데이트 시도");
                    fetchNaverUserInfoFromParent();
                }
            }, 1000);
        })
        .catch(error => console.error("[ERROR] 네이버 본인인증 요청 실패:", error));
}

// ✅ 팝업 창에서 실행 (네이버 로그인 완료 후 실행)
function handleNaverCallback() {
    console.log("[INFO] 네이버 본인인증 콜백 페이지 로드됨");

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (!code || !state) {
        console.error("[ERROR] 네이버 본인인증 코드 또는 state 값이 없습니다.");
        alert("본인인증 중 오류가 발생했습니다. 다시 시도해주세요.");
        return;
    }

    console.log("[INFO] 본인인증 성공 - Code:", code, "State:", state);

    // ✅ 네이버 사용자 정보 가져오기 요청 (팝업 창 내부)
    fetch(`/api/naver/auth/callback?code=${code}&state=${state}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("[INFO] 본인인증 성공 - 이름:", data.reporter, ", 연락처:", data.phoneNumber);

                // ✅ 부모 창으로 인증 정보를 전달
                if (window.opener) {
                    console.log("[INFO] 부모 창에 본인인증 데이터 전달 시도...");
                    window.opener.postMessage({
                        type: "NAVER_AUTH_SUCCESS",
                        reporter: data.reporter,
                        phoneNumber: data.phoneNumber
                    }, "*");

                    setTimeout(() => {
                        window.close(); // JSON 응답 창 닫기
                    }, 500); // 0.5초 후 자동 닫힘
                } else {
                    console.error("[ERROR] 부모 창이 존재하지 않습니다.");
                }
            } else {
                alert("본인인증 실패: " + data.message);
            }
        })
        .catch(error => console.error("[ERROR] 본인인증 확인 실패:", error));
}

// ✅ 부모 창에서 네이버 본인인증 결과 수신 및 UI 업데이트
window.addEventListener("message", function(event) {
    console.log("[INFO] 부모 창에서 `postMessage` 이벤트 수신:", event.data);

    if (event.data.type === "NAVER_AUTH_SUCCESS") {
        console.log("[INFO] 본인인증 데이터 수신 - 이름:", event.data.reporter, ", 연락처:", event.data.phoneNumber);

        // ✅ 부모 창에서 입력 필드 자동 채우기
        setTimeout(() => {
            const reporterInput = document.getElementById("reporter");
            const phoneNumberInput = document.getElementById("phoneNumber");
            console.log("신고자 입력 필드:", document.getElementById("reporter"));
            console.log("연락처 입력 필드:", document.getElementById("phoneNumber"));

            if (reporterInput && phoneNumberInput) {
                reporterInput.value = event.data.reporter;
                phoneNumberInput.value = event.data.phoneNumber;
                console.log("[INFO] 입력 필드에 본인인증 정보 자동 입력 완료");
            } else {
                console.error("[ERROR] 입력 필드를 찾을 수 없습니다.");
            }
        }, 1000); // 1초 후 값 입력
    }
});

// ✅ 네이버 로그인 후 사용자 정보 가져오기
function fetchNaverUserInfo(code, state) {
    console.log("[INFO] 네이버 사용자 정보 가져오기 요청");

    fetch(`/api/naver/auth/callback?code=${code}&state=${state}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("[INFO] 본인인증 성공 - 이름:", data.reporter, ", 연락처:", data.phoneNumber);

                // ✅ 부모 창에서 입력 필드 자동 채우기
                setTimeout(() => {
                    const reporterInput = document.getElementById("reporter");
                    const phoneNumberInput = document.getElementById("phoneNumber");

                    if (reporterInput && phoneNumberInput) {
                        reporterInput.value = data.reporter;
                        phoneNumberInput.value = data.phoneNumber;
                        console.log("[INFO] 입력 필드에 본인인증 정보 자동 입력 완료");
                    } else {
                        console.error("[ERROR] 입력 필드를 찾을 수 없습니다.");
                    }
                }, 500); // 500ms 후 실행

                alert("본인인증이 완료되었습니다.");
            } else {
                alert("본인인증 실패: " + data.message);
            }
        })
        .catch(error => console.error("[ERROR] 본인인증 확인 실패:", error));
}

// ✅ 부모 창에서 인증 결과 가져오기 (팝업 창 닫힌 후 실행)
function fetchNaverUserInfoFromParent() {
    console.log("[INFO] 부모 창에서 네이버 사용자 정보 가져오기 요청");

    fetch("/api/naver/auth/user")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("[INFO] 부모 창에서 본인인증 데이터 반영:", data);
                document.getElementById("reporter").value = data.reporter;
                document.getElementById("phoneNumber").value = data.phoneNumber;
                console.log("[INFO] 입력 필드 업데이트 완료");
            }
        })
        .catch(error => console.error("[ERROR] 본인인증 확인 실패:", error));
}