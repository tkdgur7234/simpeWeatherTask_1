const url = 'https://api.openweathermap.org/data/2.5/';
const key = '45f006a9f6651c2bd89393c3e1976b8c';
let city = document.querySelector(".city");
let temp = document.querySelector(".temp");
let condition = document.querySelector(".condition");
let description = document.querySelector(".description");
let minmax = document.querySelector(".minmax");
let realFeel = document.querySelector(".real-feel");
let pressure = document.querySelector(".pressure");
let windSpeed = document.querySelector(".wind-speed");
let humidity = document.querySelector(".humidity");
let windDirection = document.querySelector(".wind-direction");
let responseTime = document.querySelector(".date-response")
let sunriseTime = document.querySelector(".sunrise-time");//일출
let sunsetTime = document.querySelector(".sunset-time");//일몰
let recentSearches = [];

//City name  input
const cityName = document.getElementById('cityName');
const cityBtn = document.getElementById('cityBtn');
const validationForName = document.querySelector('.validationForName')
cityBtn.addEventListener('click', () => requestApiForCityName(cityName.value))


function requestApiForCityName(name) {
    if (name.trim() != "") {
        fetch(`${url}weather?q=${name}&appid=${key}&units=metric&lang=en`)
            .then(respons => respons.json())
            .then(result => {
                if (result.cod == 200) {
                    resetValidationForCityName();
                    // 도시명을 최근 검색 기록에 추가
                    addToRecentSearches(name);
                    // 최근 검색 기록을 테이블에 업데이트
                    updateRecentSearchesTable();
                    getCountryName(result)
                    getResponseDate();
                    getSunriseSunset(result.sys.sunrise, result.sys.sunset);// 일출 및 일몰 정보 가져오기
                    sendWeatherToChatbot(result);   // 챗봇에 날씨 정보 보내기
                }
                else {
                    resetValidationForCityName();
                    resetValues();
                    getResponseDate();
                    validationForName.innerText = "도시를 찾을 수 없습니다.";
                }
            })
    }
    else {
        resetValidationForCityName();
        resetValues();
        responseTime.innerText = "";
        validationForName.innerText = "도시이름을 써주세요.";
    }
}

// 도시명을 최근 검색 기록에 추가하는 함수
function addToRecentSearches(cityName) {
    // 최근 검색 기록 배열에 도시명 추가
    recentSearches.unshift(cityName);
    // 최근 검색 기록이 5개를 초과하는 경우 가장 오래된 항목 제거
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
}

// 최근 검색 기록 테이블을 업데이트하는 함수
function updateRecentSearchesTable() {
    const recentSearchesBody = document.getElementById('recentSearchesBody');
    // 테이블 내용 초기화
    recentSearchesBody.innerHTML = "";
    // 최근 검색 기록 배열을 순회하며 테이블에 추가
    recentSearches.forEach(city => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = city;
        row.appendChild(cell);
        recentSearchesBody.appendChild(row);
    });
}

function getCountryName(info) {
    fetch(`https://restcountries.com/v3.1/alpha?codes=${info.sys.country}`)
        .then(response => response.json())
        .then(result => weatherDetailsForCity(result, info));

}
function weatherDetailsForCity(result, info) {
    validationForName.innerText = "";

    city.innerText = `${info.name} ,${result[0].name.common}`
    temp.innerText = `${Math.round(info.main.temp)}°C`
    condition.innerText = `${info.weather[0].main}`
    description.innerText = `${info.weather[0].description}`
    minmax.innerText = `${Math.round(info.main.temp_min)}°C / ${Math.round(info.main.temp_max)}°C`
    realFeel.innerText = `${Math.round(info.main.feels_like)}°C`
    pressure.innerText = `${info.main.pressure * 100} N/m2`
    windSpeed.innerText = `${info.wind.speed} m/s`
    humidity.innerText = `${info.main.humidity}%`

    getDirection(info.wind.deg);

    // 배경화면 변경
    if (info.weather[0].main.toLowerCase() === 'clouds') {
        document.body.className = 'cloudy';
    } else if (info.weather[0].main.toLowerCase() === 'clear') {
        document.body.className = 'sunny';
    } else if (info.weather[0].main.toLowerCase() === 'snow') {
        document.body.className = 'snow';
    } else if (info.weather[0].main.toLowerCase() === 'rain') {
        document.body.className = 'rain';
    } else if (info.weather[0].main.toLowerCase() === 'fog') {
        document.body.className = 'fog';
    }
}



//Lat and Lon intputs

const corrBtn = document.getElementById('coordinantBtn');
const lat = document.getElementById('lat')
const lon = document.getElementById('lon')
const validationForCoor = document.querySelector('.validationForCoor');
corrBtn.addEventListener('click', () => requestApiForCoordinant(lat.value, lon.value));

function requestApiForCoordinant(lat, lon) {
    if (lat && lon) {
        fetch(`${url}weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=en`)
            .then(respons => respons.json())
            .then(result => {
                if (result.cod == 200) {
                    resetValidationForCorr();
                    weatherDetailsForCorr(result);
                    getResponseDate();
                    getSunriseSunset(result.sys.sunrise, result.sys.sunset); // 일출 및 일몰 정보
                    sendWeatherToChatbot(result);
                } else {
                    resetValues();
                    resetValidationForCorr();
                    getResponseDate();
                    validationForCoor.innerText = "위도와 경도를 찾을 수 없습니다.";
                }
            });
    } else {
        resetValues();
        resetValidationForCorr();
        validationForCoor.innerText = "위도 경도를 써주세요.";
    }
}


function weatherDetailsForCorr(info) {

    if (info.sys.country) {
        fetch(`https://restcountries.com/v3.1/alpha?codes=${info.sys.country}`)
            .then(response => response.json())
            .then(result => getCountryNameForCorr(result, info));
    }
    else if (info.name != "") {
        city.innerText = `${info.name},Country name not found`
    }
    else {
        city.innerText = "City name not found ,Country name not found";
    }
    CoordinantAndCurrentInnerText(info)
}
function getCountryNameForCorr(result, info) {
    city.innerText = `${info.name} , ${result[0].name.common}`
}


//Current cordiant button

const locationBtn = document.getElementById('currentLoc');
const validationForCurrLocation = document.querySelector(".validationForCurrentLocation");

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError)
    }
    else {
        console.log("!!!")
    }
})


function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    resetValidationForCurrLocation();
    fetch(`${url}weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric&lang=en`)
        .then(response => response.json())
        .then(result => {
            if (result.cod == 200) {
                weatherDetailsForCurrentPosition(result);
                getResponseDate();
                getSunriseSunset(result.sys.sunrise, result.sys.sunset); // 일출 및 일몰 정보
                sendWeatherToChatbot(result);
            } else {
                resetValues();
                resetValidationForCurrLocation();
                validationForCurrLocation.innerText = "현재 위치를 찾을 수 없습니다.";
            }
        });
}

function onError(error) {
    resetValidationForCurrLocation();
    validationForCurrLocation.innerText = error.message;
}

function weatherDetailsForCurrentPosition(info) {
    if (info.sys.country) {
        fetch(`https://restcountries.com/v3.1/alpha?codes=${info.sys.country}`)
            .then(response => response.json())
            .then(result => getCountryNameForCurrentLocation(result, info));
    }
    else if (info.name != "") {
        city.innerText = `${info.name},Country name not found`
    }
    else {
        city.innerText = "City name not found ,Country name not found";
    }
    CoordinantAndCurrentInnerText(info);
}
function getCountryNameForCurrentLocation(result, info) {
    city.innerText = `${info.name} ,${result[0].name.common}`
}

//Validations
function resetValidationForCityName() {
    lat.value = "";
    lon.value = "";
    validationForCoor.innerText = "";
    validationForCurrLocation.innerText = "";
}
function resetValidationForCurrLocation() {
    lat.value = "";
    lon.value = "";
    cityName.value = "";
    validationForCoor.innerText = "";
    validationForName.innerText = "";
}

function resetValidationForCorr() {
    cityName.value = '';
    validationForName.innerText = "";
    validationForCurrLocation.innerText = "";
}

//Wind Direction
function getDirection(degree) {
    if (degree == 0 || degree == 360) {
        windDirection.innerText = "North";
    }
    else if (degree > 0 && degree < 45) {
        windDirection.innerText = "NNE";
    }
    if (degree == 45) {
        windDirection.innerText = "NE";
    }
    if (degree > 45 && degree < 90) {
        windDirection.innerText = "ENE";
    }
    if (degree == 90) {
        windDirection.innerText = "East";
    }
    if (degree > 90 && degree < 135) {
        windDirection.innerText = "ESE";
    }
    if (degree == 135) {
        windDirection.innerText = "SE";
    }
    if (degree > 135 && degree < 180) {
        windDirection.innerHTML = "SSE";
    }
    if (degree == 180) {
        windDirection.innerText = "South";
    }
    if (degree > 180 && degree < 225) {
        windDirection.innerText = "SSW";
    }
    if (degree == 225) {
        windDirection.innerText = "SW";
    }
    if (degree > 225 && degree < 270) {
        windDirection.innerText = "WSW";
    }
    if (degree == 270) {
        windDirection.innerText = "West";
    }
    if (degree > 270 && degree < 315) {
        windDirection.innerText = "WNW";
    }
    if (degree == 315) {
        windDirection.innerText = "NW";
    }
    if (degree > 315 && degree < 360) {
        windDirection.innerText = "NNW";
    }
}

//Coordinant and Current Cordinant values 
function CoordinantAndCurrentInnerText(info) {
    validationForCoor.innerText = "";
    validationForCurrLocation.innerText = "";

    temp.innerText = `${Math.round(info.main.temp)}°C`
    condition.innerText = `${info.weather[0].main}`
    description.innerText = `${info.weather[0].description}`
    minmax.innerText = `${Math.round(info.main.temp_min)}°C / ${Math.round(info.main.temp_max)}°C`
    realFeel.innerText = `${Math.round(info.main.feels_like)}°C`
    pressure.innerText = `${info.main.pressure * 100} N/m2`
    windSpeed.innerText = `${info.wind.speed} m/s`
    humidity.innerText = `${info.main.humidity}%`
    getDirection(info.wind.deg);


}

//Reset all values
function resetValues() {
    city.innerText = "";
    temp.innerText = "";
    condition.innerText = "";
    description.innerText = "";
    minmax.innerText = "";
    realFeel.innerText = "";
    pressure.innerText = "";
    windSpeed.innerText = "";
    humidity.innerText = "";
    windDirection.innerText = "";
}

//Get response date
function getResponseDate() {
    const utcStr = new Date();
    responseTime.innerText = utcStr.toLocaleTimeString();
}

function getSunriseSunset(sunriseTimestamp, sunsetTimestamp) {
    const sunriseDate = new Date(sunriseTimestamp * 1000); // Unix timestamp를 밀리초로 변환
    const sunsetDate = new Date(sunsetTimestamp * 1000);

    const sunriseTime = sunriseDate.toLocaleTimeString(); // 로컬 시간으로 변환
    const sunsetTime = sunsetDate.toLocaleTimeString();

    document.querySelector('.sunrise-time').textContent = `${sunriseTime}`;
    document.querySelector('.sunset-time').textContent = `${sunsetTime}`;
}
// 챗봇에 날씨 정보 전달
function sendWeatherToChatbot(weather) {
    const message = {
        city: weather.name,
        temp_min: Math.round(weather.main.temp_min),
        temp_max: Math.round(weather.main.temp_max),
        humidity: weather.main.humidity,
        wind_speed: weather.wind.speed,
        weather: weather.weather[0].main,
        feels_like: Math.round(weather.main.feels_like)
    };
    window.postMessage({ type: 'weather', data: message }, '*');
}

