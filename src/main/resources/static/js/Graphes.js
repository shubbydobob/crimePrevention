// 기존 데이터 정의
const crimeDataByRegion = {
  // 예제 데이터 (원하는 지역별로 데이터 추가 가능)
};

function getDayofWeek(){
  const days = ["일","월", "화","수","목","금","토"]
  const now = new Date();
  const dayOfWeek = now.getDay();
  return days[dayOfWeek];
}
document.getElementById("currentDay").textContent = `${getDayofWeek()}요일 예상 범죄`

// 현재 시간대 계산
function getCurrentTimeRangeIndex() {
  const currentHour = new Date().getHours();
  if (0 <= currentHour && currentHour < 3) return 0;
  if (3 <= currentHour && currentHour < 6) return 1;
  if (6 <= currentHour && currentHour < 9) return 2;
  if (9 <= currentHour && currentHour < 12) return 3;
  if (12 <= currentHour && currentHour < 15) return 4;
  if (15 <= currentHour && currentHour < 18) return 5;
  if (18 <= currentHour && currentHour < 21) return 6;
  if (21 <= currentHour && currentHour <= 23) return 7;
  return -1; // 시간대 오류 시
}

// DOMContentLoaded 이벤트 처리
document.addEventListener("DOMContentLoaded", function () {
  const pieCtx1 = document.getElementById("crimePieChart").getContext("2d");
  let pieChart1;

  // 현재 시간대 데이터 로드 및 원 그래프 생성
  function fetchAndDrawTop3Crimes() {
    const currentTimeRangeIndex = getCurrentTimeRangeIndex();
    if (currentTimeRangeIndex === -1) {
      console.error("Invalid time range index.");
      return;
    }

    // 서버에서 데이터 요청
    fetch(`/graphes/current_time_top3/${currentTimeRangeIndex}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        drawPieChart(data.labels, data.data); // 원 그래프 생성
      })
      .catch((error) =>
        console.error("Error fetching current time crime data:", error)
      );
  }

  // 원 그래프 그리기
  function drawPieChart(labels, data) {
    if (pieChart1) {
      pieChart1.destroy(); // 기존 차트 삭제
    }
    pieChart = new Chart(pieCtx1, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#ff5733", "#33c1ff", "#28a745", "#ffcc00", "#ff6699"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }

  // 페이지 로드 시 현재 시간대 범죄 TOP 3 로드 및 그래프 생성
  fetchAndDrawTop3Crimes();
});




//요일 그래프
document.addEventListener("DOMContentLoaded", function () {
  const dayOfWeekCrimeCtx = document.getElementById("dayOfWeekCrimeChart").getContext("2d");
  let dayOfWeekCrimeChart;

  // 요일별 데이터 로드 및 그래프 생성
  function fetchAndDrawDayOfWeekCrime() {
      fetch('/graphes/day_of_week_crime')
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
            // 데이터가 제대로 로드되었는지 확
            if (data.labels && data.data) {
                drawDayOfWeekCrimeChart(data.labels, data.data);
            } else {
                console.error("No data received for day of week crime chart");
            }
          })
          .catch(error => console.error("Error fetching day of week crime data:", error));
  }

  // 요일별 그래프 그리기
  function drawDayOfWeekCrimeChart(labels, data) {
      if (dayOfWeekCrimeChart) {
          dayOfWeekCrimeChart.destroy();
      }
      dayOfWeekCrimeChart = new Chart(dayOfWeekCrimeCtx, {
          type: 'pie',
          data: {
              labels: labels,
              datasets: [{
                  data: data,
                  backgroundColor: ['#ff5733', '#33c1ff', '#28a745', '#ffcc00', '#ff6699', '#34d3ff', '#ff9c00'],
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  legend: {
                      position: 'top'
                  }
              }
          }
      });
  }

  // 요일별 데이터 로드
  fetchAndDrawDayOfWeekCrime();
});

// 조회 막대 그래프
document.addEventListener("DOMContentLoaded", function () {
  const mainRegionSelect = document.getElementById("mainRegionSelect");
  const subRegionSelect = document.getElementById("subRegionSelect");
  const pieCtx = document.getElementById("crimeChart").getContext("2d");
  let pieChart; //변수 선언, 원 그래프 객체 저장 준비 (전역적 선언, 그래프 업데이트/삭제 가능)

  // 메인 지역 선택 시 세부 지역 데이터 로드
  mainRegionSelect.addEventListener("change", function () {
    const selectedMainRegion = mainRegionSelect.value;

    // 세부 지역 로드
    fetch(`/graphes/subregions/${selectedMainRegion}`)
      .then(response => response.json())//응답 데이터를 javaScript에서 사용 가능한 객체로 파싱
      .then(data => { //data 변수로 넘김, 세부 지역 데이터를 사용해 드롭다운 업데이트
        // 세부 지역 리스트 초기화
        subRegionSelect.innerHTML = `<option value="">세부 지역을 선택하세요</option>`;
        data.forEach(subregion => {
          const option = document.createElement("option");
          option.value = subregion;
          option.textContent = subregion;
          subRegionSelect.appendChild(option);
        });
      })
      .catch(error => console.error("Error fetching subregions:", error));
  });

  // 세부 지역 선택 시 범죄 데이터 로드 및 원 그래프 갱신
  subRegionSelect.addEventListener("change", function () {
    const selectedMainRegion = mainRegionSelect.value;
    const selectedSubRegion = subRegionSelect.value;
    if (!selectedSubRegion) return; // 세부 지역 선택되지 않았다면 함수 실행 중단

    // 올바른 URL 형식으로 요청
    fetch(`/graphes/plot/${selectedMainRegion}/${selectedSubRegion}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        drawBarChart(data.labels, data.data); // 원 그래프 업데이트
      })
      .catch(error => console.error("Error fetching crime data:", error));
  });

  // 차트를 그리는 함수 (막대 그래프)
  function drawBarChart(labels, data) {
    if (pieChart) {
      pieChart.destroy(); // 기존 차트 삭제
    }
    pieChart = new Chart(pieCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '범죄 발생 건수',
          data: data,
          backgroundColor: ['#ff5733', '#33c1ff', '#28a745', '#ffcc00', '#ff6699'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true // y축이 0부터 시작하도록 설정
          }
        },
        plugins: {
          legend: {
            display: false,
          }
        }
      }
    });
  }
}
);
document.addEventListener("DOMContentLoaded", function() {
  const datePicker = document.getElementById("datePicker");
  const tableContainer = document.getElementById("table-container");
  const articleContentContainer = document.querySelector(".new-grid-box");

  if (!tableContainer) {
      console.error("Table container not found!");
      return;
  }

  datePicker.addEventListener("change", function(){
    const selectedDate = datePicker.value;

    if (!selectedDate) return;

    fetch(`/graphes/articles/${selectedDate}`)
      .then(response => {
        if(!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        updateNewsTable(data, tableContainer, articleContentContainer);
      })
      .catch(error => {
        console.error("Error fetching articles:", error);
        tableContainer.innerHTML = "<p>데이터를 불러오는 중 문제가 발생했습니다.</p>";
      });
  });

  // Add click event to existing table rows
  const existingRows = tableContainer.querySelectorAll('tbody tr');
  existingRows.forEach((row, index) => {
      row.addEventListener('click', function() {
          // Assuming the first 5 rows are from the initial table
          displayArticleContent(initialArticles[index], articleContentContainer);
      });
  });
});

function updateNewsTable(articles, tableContainer, articleContentContainer) {
  if (!tableContainer) return;

  if (articles.length === 0) {
      tableContainer.innerHTML = "<p>해당 날짜에 뉴스가 없습니다.</p>";
      return;
  }

  let tableHTML = "<table class='table table-striped'>";
  tableHTML += `
      <thead>
          <tr>
              <th>제목</th>
              <th>일자</th>
              <th>언론사</th>
          </tr>
      </thead>
      <tbody>
  `;

  articles.forEach((article, index) => {
      tableHTML += `
          <tr data-index="${index}">
              <td>${article["제목"]}</td>
              <td>${new Date(article["일자"]).toLocaleDateString()}</td>
              <td>${article["언론사"]}</td>
          </tr>
      `;
  });

  tableHTML += "</tbody></table>";
  tableContainer.innerHTML = tableHTML;

  // Add click event to new table rows
  const newRows = tableContainer.querySelectorAll('tbody tr');
  newRows.forEach(row => {
      row.addEventListener('click', function() {
          const index = this.getAttribute('data-index');
          displayArticleContent(articles[index], articleContentContainer);
      });
  });
}

function displayArticleContent(article, articleContentContainer) {
  if (!articleContentContainer) return;

  articleContentContainer.innerHTML = `
      <h4>${article["제목"]}</h4>

      <div class="article-body">${article["본문"]}</div>
  `;
}
