// 범죄 유형 대분류와 중분류 데이터
const crimeCategories = {
    "강력범죄": ["살인기수", "살인미수등", "강도", "강간", "유사강간", "강제추행", "기타 강간 강제추행등", "방화"],
    "절도범죄": ["절도범죄"],
    "폭력범죄": ["상해", "폭행", "체포감금", "협박", "약취 유인", "폭력행위등", "공갈", "손괴"],
    "지능범죄": ["직무유기", "직권남용", "증수뢰", "통화", "문서 인장", "유가증권인지", "사기", "횡령", "배임"],
    "풍속범죄": ["성풍속범죄", "도박범죄"],
    "특별경제범죄": ["특별경제범죄"],
    "마약범죄": ["마약범죄"],
    "보건범죄": ["보건범죄"],
    "환경범죄": ["환경범죄"],
    "교통범죄": ["교통범죄"],
    "노동범죄": ["노동범죄"],
    "안보범죄": ["안보범죄"],
    "선거범죄": ["선거범죄"],
    "병역범죄": ["병역범죄"],
    "기타범죄": ["기타범죄"]
};

// 모달 열기
function openReportModal() {
    console.log('신고 모달 열기 시도'); // 디버깅 로그
    document.getElementById('report-modal').style.display = 'flex';
    populateCategories(); // 대분류 옵션 추가

}

// 모달 닫기
function closeReportModal() {
    console.log('신고 모달 닫기 시도'); // 디버깅 로그
    document.getElementById('report-modal').style.display = 'none';
}


// 대분류 옵션 추가
function populateCategories() {
    const categorySelect = document.getElementById('majorCategory');
    categorySelect.innerHTML = '<option value="" disabled selected>선택하세요</option>'; // 초기화

    for (const category in crimeCategories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    }
}

// 중분류 옵션 업데이트
function updateSubCategories() {
    const categorySelect = document.getElementById('majorCategory');
    const subCategorySelect = document.getElementById('middleCategory');

    const selectedCategory = categorySelect.value;
    const subCategories = crimeCategories[selectedCategory];

    subCategorySelect.innerHTML = '<option value="" disabled selected>선택하세요</option>'; // 초기화

    if (subCategories) {
        subCategories.forEach(subCategory => {
            const option = document.createElement('option');
            option.value = subCategory;
            option.textContent = subCategory;
            subCategorySelect.appendChild(option);
        });
    }
}

// 신고 접수 제출
document.getElementById('reportForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 기본 폼 제출 방지
    console.log('폼 제출 이벤트 발생'); // 디버깅 로그

    // 신고 정보 데이터 수집
    const formData = new FormData(this);
    console.log('폼 데이터:', Array.from(formData.entries())); // 폼 데이터 로그

    // 서버로 데이터 전송 (예: REST API 호출)
    fetch('/Board', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('서버 응답 상태 코드:', response.status); // 응답 상태 코드 로그
            if (response.ok) {
                alert('신고가 성공적으로 접수되었습니다.');
                closeReportModal();
            } else {
                alert('신고 접수에 실패했습니다.');
                console.error('서버 응답 오류:', response.statusText); // 오류 상태 텍스트 로그
            }
        })
        .catch(error => {
            console.error('신고 접수 오류:', error);
            alert('신고 접수 중 오류가 발생했습니다.');
        });
});

function goToBoardPage() {
    try {
        window.location.href = "/Board"; // Board 페이지로 이동
    } catch (e) {
        console.error("페이지 이동 중 오류 발생:", e);
    }
}

// Toggle between the service and report content
function toggleService(type) {
    const serviceContent = document.getElementById('serviceContent');
    const reportContent = document.getElementById('reportContent');
    const serviceLabel = document.querySelector("label[for='serviceRadio']");
    const reportLabel = document.querySelector("label[for='reportRadio']");

    if (type === 'service') {
        serviceContent.style.display = 'block';
        reportContent.style.display = 'none';
        serviceLabel.classList.add('active');
        reportLabel.classList.remove('active');
    } else if (type === 'report') {
        serviceContent.style.display = 'none';
        reportContent.style.display = 'block';
        reportLabel.classList.add('active');
        serviceLabel.classList.remove('active');
    }
}