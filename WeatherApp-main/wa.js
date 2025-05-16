const apiKey = "881aff09233d7a07c65720510e33e1ef";
const apiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const geoUrl = "https://api.openweathermap.org/geo/1.0/direct?q=";

const searchbox = document.querySelector(".search input");
const searchbtn = document.querySelector(".search button");
const suggestionsList = document.querySelector(".suggestions");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");

let chartInstance;  // dito naman nag ke create

function renderChart(temps) {
  const ctx = document.getElementById("tempChart").getContext("2d");

  // inaalis dito yung chart na nagawa una mga ya
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],  
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderColor: "#fff",
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });
}

function checkWeather(city) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", apiUrl + city + `&appid=${apiKey}`);
  xhr.onload = function () {
    if (xhr.status == 404) {
      document.querySelector(".error").style.display = "block";
      document.querySelector(".weather").style.display = "none";
      card.setAttribute("data-weather", "default");
    } else {
      const data = JSON.parse(xhr.responseText);

      document.querySelector(".city").innerHTML = data.city.name;
      document.querySelector(".temp").innerHTML = Math.round(data.list[0].main.temp) + "°c";
      document.querySelector(".humidity").innerHTML = data.list[0].main.humidity + "%";
      document.querySelector(".wind").innerHTML = data.list[0].wind.speed + " km/h";

      const weatherType = data.list[0].weather[0].main;
      document.querySelector(".weather-name").innerHTML = weatherType;

      if (weatherType === "Clouds") {
        weatherIcon.src = "icons/cloudy.png";
        card.setAttribute("data-weather", "cloudy");
      } else if (weatherType === "Clear") {
        weatherIcon.src = "icons/sun.png";
        card.setAttribute("data-weather", "sunny");
      } else if (weatherType === "Rain") {
        weatherIcon.src = "icons/rain.png";
        card.setAttribute("data-weather", "rainy");
      } else if (weatherType === "Drizzle") {
        weatherIcon.src = "icons/drizzle.png";
        card.setAttribute("data-weather", "drizzle");
      } else if (weatherType === "Mist") {
        weatherIcon.src = "icons/mist.png";
        card.setAttribute("data-weather", "mist");
      } else if (weatherType === "Snow") {
        weatherIcon.src = "icons/snow.png";
        card.setAttribute("data-weather", "snow");
      } else {
        card.setAttribute("data-weather", "default");
      }

      // grAPH
      const temps = data.list.slice(0, 7).map(item => item.main.temp);  
      renderChart(temps);

      document.querySelector(".weather").style.display = "block";
      document.querySelector(".error").style.display = "none";
    }
  };
  xhr.send();
}

searchbtn.addEventListener("click", () => {
  checkWeather(searchbox.value);
  suggestionsList.innerHTML = "";
});

searchbox.addEventListener("input", function () {
  const query = searchbox.value.trim();
  if (query.length < 2) {
    suggestionsList.innerHTML = "";
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${geoUrl}${query}&limit=5&appid=${apiKey}`);
  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      suggestionsList.innerHTML = "";

      data.forEach(location => {
        const li = document.createElement("li");
        li.textContent = `${location.name}, ${location.state || ""}, ${location.country}`;
        li.addEventListener("click", () => {
          searchbox.value = location.name;
          checkWeather(location.name);
          suggestionsList.innerHTML = "";
        });
        suggestionsList.appendChild(li);
      });
    }
  };
  xhr.send();

  document.querySelectorAll(".stars span").forEach(star => {
    star.addEventListener("click", function () {
      const rating = parseInt(this.getAttribute("data-star"));
      document.querySelectorAll(".stars span").forEach(s => {
        s.classList.toggle("selected", parseInt(s.getAttribute("data-star")) <= rating);
      });
      console.log("User rating:", rating);
    });
  });
});
