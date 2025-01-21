// 기존 데이터 정의
const crimeDataByRegion = {
  // 예제 데이터 (원하는 지역별로 데이터 추가 가능)
};

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
    fetch(`/current_time_top3/${currentTimeRangeIndex}`)
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




//세번째 그래프
document.addEventListener("DOMContentLoaded", function () {
  const dayOfWeekCrimeCtx = document.getElementById("dayOfWeekCrimeChart").getContext("2d");
  let dayOfWeekCrimeChart;

  // 요일별 데이터 로드 및 그래프 생성
  function fetchAndDrawDayOfWeekCrime() {
      fetch('/day_of_week_crime')
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



// ---------------------------------------------------
// 새로운 원 그래프 데이터 처리 및 로징 추가
// ---------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const mainRegionSelect = document.getElementById("mainRegionSelect");
  const subRegionSelect = document.getElementById("subRegionSelect");
  const pieCtx = document.getElementById("crimeChart").getContext("2d");
  let pieChart;

  // 메인 지역 선택 시 세부 지역 데이터 로드
  mainRegionSelect.addEventListener("change", function () {
    const selectedMainRegion = mainRegionSelect.value;

    // 세부 지역 로드
    fetch(`/subregions/${selectedMainRegion}`)
      .then(response => response.json())
      .then(data => {
        // 세부 지역 리스트 초기화
        subRegionSelect.innerHTML = `<option value="">세부 지역을 선택하세요</option>`;
        data.subregions.forEach(subregion => {
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
    if (!selectedSubRegion) return;
  
    // 올바른 URL 형식으로 요청
    fetch(`/plot/${selectedMainRegion}/${selectedSubRegion}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        drawPieChart(data.labels, data.data); // 원 그래프 업데이트
      })
      .catch(error => console.error("Error fetching crime data:", error));
  });
  
  // 차트를 그리는 함수 (원 그래프)
  function drawPieChart(labels, data) {
    if (pieChart) {
      pieChart.destroy(); // 기존 차트 삭제
    }
    pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#ff5733', '#33c1ff', '#28a745', '#ffcc00', '#ff6699'],
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
});