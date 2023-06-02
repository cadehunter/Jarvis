var DateTime = luxon.DateTime;

function setLoadingStatus(loadingStatus) {

    document.querySelector(".loadingScreen div p").textContent = loadingStatus;

}

function chooseFrom(arrayOfOptions) {

    return arrayOfOptions[Math.floor(Math.random() * arrayOfOptions.length)];

}

function showContentScreen() {

    document.querySelector(".loadingScreen").classList.add("hidden");
    document.querySelector(".contentScreen").classList.remove("hidden");


}

var weatherInterface = {

    key: '0d52dcde31467563956e1aba2da10ab9',

    getWeather: function (callback) {

        //Get the user's Open Weather API location.
        getOpenWeatherLocation(function (locationObject) {

            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {

                    callback(JSON.parse(this.responseText));

                }
            };
            
            var locationQueryString = locationObject[0].name;
            if (locationObject[0].state) {
                locationQueryString += "," + locationObject[0].state;
            }
            if (locationObject[0].country) {
                locationQueryString += "," + locationObject[0].country;
            }
            
            request.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=" + locationQueryString + "&appid=" + weatherInterface.key, true);
            request.send();

        });

    }

}

function getLocation(callback) {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
    } else {
        speechSynthesisEngine.queue.add("I'm afraid geolocation is not supported by this browser.", "urgent");
    }

}

function getOpenWeatherLocation(callback) {

    getLocation(function (locationObject) {

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                callback(JSON.parse(this.responseText));

            }
        };
        request.open("GET", "https://api.openweathermap.org/geo/1.0/reverse?lat=" + locationObject.coords.latitude + "&lon=" + locationObject.coords.longitude + "&limit=" + 3 + "&appid=" + weatherInterface.key, true);
        request.send();

    });

}

function kelvinToFarenheit(kelvin) {
    return ((kelvin - 273.15) * (9/5) + 32)
}



//Deploy countermeasures if the developer tools open in order to prevent the page from being modified or hacked.
function developerToolsOpen() {

    //    speechSynthesisEngine.queue.add({
    //        priority: "urgent",
    //        message: "I believe your intentions to be hostile. Deploying countermeasures."
    //    })

}