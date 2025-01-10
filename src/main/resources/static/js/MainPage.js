// 헤더 범죄자
// 지역 선택 모달 열기
function showRegionModal() {
    document.getElementById("regionModal").style.display = "flex";
}

// 지역 선택 모달 닫기
function closeRegionModal() {
    document.getElementById("regionModal").style.display = "none";
}

// 범죄자 리스트 자동 생성 함수 (랜덤)
// 범죄자 데이터베이스 (지역별 범죄자 데이터)
const criminalsDatabase = {
    서울: [
        { name: "강철훈", info: ["강도", "살인"], img: "criminal1.jpg" },
        { name: "박무진", info: ["납치", "폭행", "협박"], img: "criminal2.jpg" },
        { name: "유건호", info: ["협박", "절도", "공갈"], img: "criminal3.jpg" }
    ],
    경기도: [
        { name: "이강수", info: ["사기", "위조"], img: "criminal4.jpg" },
        { name: "최도헌", info: ["방화", "협박", "살인"], img: "criminal5.jpg" },
        { name: "김광일", info: ["금융 범죄", "도박", "공갈"], img: "criminal6.jpg" }
    ],
    강원도: [
        { name: "정해준", info: ["공갈", "강도", "절도"], img: "criminal7.jpg" },
        { name: "임재혁", info: ["납치", "폭행", "위조"], img: "criminal8.jpg" },
        { name: "조민철", info: ["절도", "살인 미수", "협박"], img: "criminal9.jpg" }
    ],
    충청북도: [
        { name: "윤미래", info: ["사기", "강도", "납치"], img: "criminal10.jpg" },
        { name: "권하늘", info: ["협박", "절도", "공갈"], img: "criminal1.jpg" },
        { name: "백다연", info: ["살인", "납치", "폭행"], img: "criminal2.jpg" }
    ],
    충청남도: [
        { name: "이서진", info: ["위조", "사기"], img: "criminal3.jpg" },
        { name: "정하늘", info: ["방화", "절도", "강도"], img: "criminal4.jpg" },
        { name: "박다혜", info: ["납치", "공갈", "협박"], img: "criminal5.jpg" }
    ],
    전라북도: [
        { name: "조태영", info: ["강도", "살인"], img: "criminal6.jpg" },
        { name: "김태수", info: ["납치", "위조", "공갈"], img: "criminal7.jpg" },
        { name: "박혜림", info: ["협박", "절도"], img: "criminal8.jpg" }
    ],
    전라남도: [
        { name: "한상혁", info: ["금융 범죄", "도박"], img: "criminal9.jpg" },
        { name: "강지훈", info: ["절도", "강도", "협박"], img: "criminal10.jpg" },
        { name: "이민아", info: ["납치", "살인"], img: "criminal1.jpg" }
    ],
    경상북도: [
        { name: "박하영", info: ["위조", "공갈"], img: "criminal2.jpg" },
        { name: "김서현", info: ["강도", "협박"], img: "criminal3.jpg" },
        { name: "최민기", info: ["납치", "폭행", "사기"], img: "criminal4.jpg" }
    ],
    경상남도: [
        { name: "홍수연", info: ["공갈", "절도", "방화"], img: "criminal5.jpg" },
        { name: "박준우", info: ["강도", "살인"], img: "criminal6.jpg" },
        { name: "김하늘", info: ["협박", "납치", "위조"], img: "criminal7.jpg" }
    ],
    제주: [
        { name: "오세준", info: ["사기", "강도", "납치"], img: "criminal8.jpg" },
        { name: "조은지", info: ["절도", "폭행"], img: "criminal9.jpg" },
        { name: "이도훈", info: ["위조", "협박", "금융 범죄"], img: "criminal10.jpg" }
    ],
    부산: [
        { name: "한예준", info: ["살인", "방화", "협박"], img: "criminal1.jpg" },
        { name: "김현우", info: ["납치", "사기", "절도"], img: "criminal2.jpg" },
        { name: "박소현", info: ["공갈", "강도"], img: "criminal3.jpg" }
    ],
    대구: [
        { name: "정준영", info: ["납치", "폭행"], img: "criminal4.jpg" },
        { name: "김세훈", info: ["사기", "절도", "위조"], img: "criminal5.jpg" },
        { name: "오민영", info: ["협박", "살인"], img: "criminal6.jpg" }
    ],
    인천: [
        { name: "강승우", info: ["절도", "납치", "방화"], img: "criminal7.jpg" },
        { name: "윤소민", info: ["공갈", "위조", "협박"], img: "criminal8.jpg" },
        { name: "김도연", info: ["폭행", "강도"], img: "criminal9.jpg" }
    ],
    광주: [
        { name: "한승민", info: ["사기", "금융 범죄"], img: "criminal10.jpg" },
        { name: "박다은", info: ["절도", "납치"], img: "criminal1.jpg" },
        { name: "최현준", info: ["살인", "협박", "폭행"], img: "criminal2.jpg" }
    ],
    대전: [
        { name: "윤지우", info: ["방화", "납치"], img: "criminal3.jpg" },
        { name: "김혜린", info: ["사기", "절도"], img: "criminal4.jpg" },
        { name: "조하늘", info: ["살인", "협박"], img: "criminal5.jpg" }
    ],
    울산: [
        { name: "박지훈", info: ["납치", "공갈", "강도"], img: "criminal6.jpg" },
        { name: "한민수", info: ["절도", "위조"], img: "criminal7.jpg" },
        { name: "오세민", info: ["협박", "폭행"], img: "criminal8.jpg" }
    ],
    세종: [
        { name: "김도현", info: ["방화", "납치", "공갈"], img: "criminal9.jpg" },
        { name: "이하영", info: ["강도", "협박"], img: "criminal10.jpg" },
        { name: "정지우", info: ["사기", "폭행", "위조"], img: "criminal1.jpg" }
    ]
};


// 지역별 범죄자 리스트를 로드
function loadCriminalsByRegion(region) {
    const criminalGrid = document.getElementById("criminalGrid");
    criminalGrid.innerHTML = ""; // 기존 데이터 초기화

    // 지역별 데이터 가져오기
    const regionCriminals = criminalsDatabase[region];

    // 랜덤 범죄자 수 (8 ~ 15명)
    const numCriminals = Math.floor(Math.random() * (15 - 8 + 1)) + 8;

    // 랜덤으로 범죄자 선택
    const randomCriminals = [];
    for (let i = 0; i < numCriminals; i++) {
        const randomIndex = Math.floor(Math.random() * regionCriminals.length);
        randomCriminals.push(regionCriminals[randomIndex]);
    }

    // 범죄자 카드 생성
    randomCriminals.forEach((criminal) => {
        const card = document.createElement("div");
        card.classList.add("custom-criminal-card");

        const img = document.createElement("img");
        img.src = criminal.img;
        img.alt = criminal.name;

        const name = document.createElement("p");
        name.innerHTML = `<strong>이름:</strong> ${criminal.name}`;

        const info = document.createElement("p");
        info.innerHTML = `<strong>범죄:</strong> ${criminal.info.join(", ")}`;

        const regionInfo = document.createElement("p");
        regionInfo.innerHTML = `<strong>지역:</strong> ${region}`;

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(info);
        card.appendChild(regionInfo);

        criminalGrid.appendChild(card);
    });
}

// 모달 열기
function openCrimeModal() {
    document.getElementById('crime-modal').style.display = 'flex';
    updateStatistics(); // 모달이 열릴 때 초기 데이터 로드
}

// 모달 닫기
function closeCrimeModal() {
    document.getElementById('crime-modal').style.display = 'none';
}

// 통계 업데이트
function updateStatistics() {
    const day = document.getElementById('crime-day').value;
    const time = document.getElementById('crime-time').value;

    // 서버에서 데이터 가져오기
    fetch(`/api/crime-data?day=${day}&time=${time}`)
        .then(response => response.json())
        .then(data => {
            // 원형 그래프 업데이트 (시간대별 범죄 유형 비율)
            updateCrimePieChart(data.pieChartData);

            // 막대 그래프 업데이트 (요일별 범죄 발생 건수)
            updateCrimeBarChart(data.barChartData);
        })
        .catch(error => {
            console.error('데이터 로드 오류:', error);
        });
}

// Chart.js를 사용한 원형 그래프 구현
let crimePieChart;
function updateCrimePieChart(data) {
    const ctx = document.getElementById('crime-pieChart').getContext('2d');
    if (crimePieChart) {
        crimePieChart.destroy(); // 기존 차트를 삭제
    }
    crimePieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels, // 예: ['폭행', '절도', '사기']
            datasets: [{
                data: data.values, // 예: [30, 40, 30]
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Chart.js를 사용한 막대 그래프 구현
let crimeBarChart;
function updateCrimeBarChart(data) {
    const ctx = document.getElementById('crime-barChart').getContext('2d');
    if (crimeBarChart) {
        crimeBarChart.destroy(); // 기존 차트를 삭제
    }
    crimeBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels, // 예: ['월요일', '화요일', '수요일', ...]
            datasets: [{
                label: '범죄 발생 건수',
                data: data.values, // 예: [15, 20, 10, ...]
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


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

// 폼 제출
document.getElementById('reportForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 기본 폼 제출 방지
    console.log('폼 제출 이벤트 발생'); // 디버깅 로그

    // 폼 데이터 수집
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
