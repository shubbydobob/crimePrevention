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

document.addEventListener("DOMContentLoaded", function () {
  // 그래프 컨텍스트 설정
  const crimePieCtx = document.getElementById("crimePieChart").getContext("2d");
  const dayOfWeekCrimeCtx = document.getElementById("dayOfWeekCrimeChart").getContext("2d");
  const crimeChartCtx = document.getElementById("crimeChart").getContext("2d");

  let crimePieChart;
  let dayOfWeekCrimeChart;
  let crimeChart;

  // 현재 시간대 예상 범죄 TOP 3 데이터 로드 및 그래프 생성
  function fetchAndDrawTop3Crimes() {
    const currentTimeRangeIndex = getCurrentTimeRangeIndex();
    if (currentTimeRangeIndex === -1) {
      console.error("Invalid time range index.");
      return;
    }

    fetch(`/graphes/current-time-top3/${currentTimeRangeIndex}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        drawPieChart(crimePieCtx, data.labels, data.data, crimePieChart);
      })
      .catch(error => console.error("Error fetching current time crime data:", error));
  }

  // 요일별 범죄 발생률 데이터 로드 및 그래프 생성
  function fetchAndDrawDayOfWeekCrime() {
    fetch('/graphes/day-of-week-crime')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        drawPieChart(dayOfWeekCrimeCtx, data.labels, data.data, dayOfWeekCrimeChart);
      })
      .catch(error => console.error("Error fetching day of week crime data:", error));
  }

  // 지역별 데이터 로드 및 그래프 생성
  function setupRegionSelects() {
    const mainRegionSelect = document.getElementById("mainRegionSelect");
    const subRegionSelect = document.getElementById("subRegionSelect");

    mainRegionSelect.addEventListener("change", function () {
      const selectedMainRegion = mainRegionSelect.value;

      fetch(`/graphes/subregions/${selectedMainRegion}`)
        .then(response => response.json())
        .then(data => {
          subRegionSelect.innerHTML = `<option value="">세부 지역을 선택하세요</option>`;
          data.subregions.forEach(subregion => {
            const option = document.createElement("option");
            option.value = subregion;
            option.textContent = subregion;

