setLoadingStatus("Establishing database...");

var languageProcessingDatabase = {

    dictionary: {

        wellnessInquiry: {
            input: [" how do you do ", " fine how are you ", " how are you come on ", " how are you ", " are you ", " have you been ", " are you doing "],
            output: function (outputEvent) {
                if (outputEvent.matchForInput == " how do you do ") {
                    speechSynthesisEngine.speakResultOfIntent(["Fine how are you?"], "normal", {
                        name: "wellnessResponse",
                        persistent: false,
                        information: undefined
                    });
                    return;
                } else if (outputEvent.matchForInput == " fine how are you ") {
                    speechSynthesisEngine.speakResultOfIntent(["How you come on?"], "normal", {
                        name: "wellnessResponse",
                        persistent: false,
                        information: undefined
                    });
                    return;
                } else if (outputEvent.matchForInput == " how are you come on ") {
                    speechSynthesisEngine.speakResultOfIntent(["Pretty good, sure as you're born."], "normal");
                    return;
                }

                var askForResponse = chooseFrom([true, false]);
                if (askForResponse) {
                    speechSynthesisEngine.speakResultOfIntent(["I am doing well. How have you been?", "I am fine. How are you &DA?", "I am well. Are you alright?"], "normal", {
                        name: "wellnessResponse",
                        persistent: false,
                        information: undefined
                    });
                } else {
                    speechSynthesisEngine.speakResultOfIntent(["I am doing well, as always.", "&DA I am a computer. I have no emotions.", "I am doing well. Thank you for your concern &DA"]);
                }
            }
        },
        wellnessResponse: {
            input: [" not great ", " great ", " not good ", " good ", " well ", " okay ", " adequate ", " bad ", " well "],
            output: function (outputEvent) {

                switch (outputEvent.matchForInput) {

                    case " great ":
                    case " good ":
                    case " well ":
                        speechSynthesisEngine.speakResultOfIntent(["Wonderful.", "Sounds wonderful &DA.", "Good for you &DA."])
                        break;
                    case " okay ":
                    case " adequate ":
                        speechSynthesisEngine.speakResultOfIntent(["Good for you &DA."])
                        break;
                    case " not great ":
                    case " not good ":
                    case " bad ":
                        speechSynthesisEngine.speakResultOfIntent(["I'm sorry to hear that &DA.", "My condolences &DA."])
                        break;

                }

            },
            requiredContext: "wellnessResponse"
        },
        greeting: {
            input: [" hello ", " hi ", " hey ", " greetings ", " hola "],
            output: function () {
                speechSynthesisEngine.speakResultOfIntent(["Hello &DA", "Hello there &DA", "Welcome back &DA"])
            }
        },
        weatherHighLow: {
            input: [" high ", " low "],
            output: function () {

                weatherInterface.getWeather(function (weatherObject) {

                    var high = kelvinToFarenheit(weatherObject.main.temp_max);
                    var low = kelvinToFarenheit(weatherObject.main.temp_min);

                    speechSynthesisEngine.speakResultOfIntent([
                        "The high will be " + high.round() + " degrees, and the low will be " + low.round() + " degrees.",
                        "The high today is " + high.round() + " degrees farenheit, and the low is " + low.round() + " degrees.",
                        "Today's high will be " + high.round() + " degrees, and the low will be " + low.round() + " degrees."
                    ]);

                });

            }
        },
        weatherTemperature: {
            input: [" temperature ", " hot ", " cold ", " warm ", " cool "],
            output: function () {

                weatherInterface.getWeather(function (weatherObject) {

                    var currentTemperature = kelvinToFarenheit(weatherObject.main.temp);
                    var feelsLikeTemperature = kelvinToFarenheit(weatherObject.main.temp);
                    var high = kelvinToFarenheit(weatherObject.main.temp_max);
                    var low = kelvinToFarenheit(weatherObject.main.temp_min);

                    //Only speak the feels like temperature if it's different from the actual temperature
                    if (currentTemperature.round() == feelsLikeTemperature.round()) {

                        speechSynthesisEngine.speakResultOfIntent([
                            "It is currently " + currentTemperature.round() + " degrees.",
                            "The temperature is currently " + currentTemperature.round() + " degrees &DA",
                            "The current temperature in " + weatherObject.name + " is " + currentTemperature.round() + " degrees &DA."
                        ]);

                    } else {

                        speechSynthesisEngine.speakResultOfIntent([
                            "It is currently " + currentTemperature.round() + " degrees, but it feels like " + feelsLikeTemperature.round() + " degrees &DA",
                            "The temperature is currently " + currentTemperature.round() + " degrees, but it feels like " + feelsLikeTemperature.round(),
                            "The current temperature in " + weatherObject.name + " is " + currentTemperature.round() + " degrees, but it feels like " + feelsLikeTemperature.round(),  
                        ]);

                    }

                });

            }
        },
        weatherWind: {
            input: [" wind "],
            output: function () {

                weatherInterface.getWeather(function (weatherObject) {

                    var speed = (weatherObject.wind.speed * 2.237);
                    var angle = weatherObject.wind.deg;

                    //Convert the meteorological angle to a compass direction
                    angle = Math.floor((angle / 22.5) + 0.5);
                    var directionArray = ["north", "north northeast", "northeast", "east northeast", "east", "east southeast", "southeast", "south southeast", "south", "south southwest", "southwest", "west southwest", "west", "north northwest", "northwest", "north northwest"];
                    var direction = directionArray[(angle % 16)];

                    speechSynthesisEngine.speakResultOfIntent([
                        "The wind is blowing " + direction + " at a speed of " + speed + " miles per hour &DA",
                        "Currently, the wind is blowing " + direction + " with a speed of " + speed + " miles per hour.",
                        "The wind is currently blowing " + direction + " at " + speed + " miles per hour.",
                    ]);

                });

            }
        },
        weatherClouds: {
            input: [" clouds ", " cloud ", " cloudy ", " cloudiness "],
            output: function () {

                weatherInterface.getWeather(function (weatherObject) {

                    var cloudCoverage = weatherObject.clouds.all;

                    speechSynthesisEngine.speakResultOfIntent([
                        "Cloud coverage is currently at about " + cloudCoverage + " percent &DA",
                        "Currently, cloud coverage is at " + cloudCoverage + " percent.",
                        "Cloud coverage is at " + cloudCoverage + " percent in " + weatherObject.name + " &DA."
                    ]);

                });

            }
        },
        weatherHumidity: {
            input: [" humidity ", " moisture "],
            output: function () {

                weatherInterface.getWeather(function (weatherObject) {

                    var humidity = weatherObject.main.humidity;

                    speechSynthesisEngine.speakResultOfIntent([
                        "The humidity in " + weatherObject.name + " is currently " + humidity + " percent &DA",
                        weatherObject.name + " currently has a humidity of " + humidity + " percent.",
                        "Humidity is currently " + humidity + " percent &DA",
                    ]);

                });

            }

        },
        weatherConditions: {
            input: [" weather ", " conditions "],
            output: function () {

                weatherInterface.getWeather(function (weatherObject) {

                    var condition = weatherObject.weather[0].description;
                    var sentenceStructure = "is"
                    switch (condition) {
                        case "clear sky":
                            condition = "clear";
                            break;
                        case "few clouds":
                            sentenceStructure = "are";
                            break;
                        case "scattered clouds":
                            sentenceStructure = "are";
                            break;
                        case "broken clouds":
                            sentenceStructure = "are";
                            break;
                        case "shower rain":
                            condition = "rainy with showers";
                            break;
                        case "rain":
                            condition = "rainy";
                            break;
                        case "thunderstorm":
                            condition = "thunderstorms"
                            sentenceStructure = "are";
                            break;
                        case "snow":
                            condition = "snowy";
                            break;
                        case "mist":
                            condition = "misty";
                            break;
                        
                        
                    }

                    if (sentenceStructure == "are") {
                        
                        speechSynthesisEngine.speakResultOfIntent([
                            "It is currently " + condition + " &DA",
                            "It is currently " + condition + " in " + weatherObject.name,
                            "The weather is currently " + condition + " in " + weatherObject.name,
                        ]);
                        
                    } else {
                        
                        speechSynthesisEngine.speakResultOfIntent([
                            "There are currently " + condition + " &DA",
                            "There are currently " + condition + " in " + weatherObject.name
                        ]);
                        
                    }

                });

            }
        },

    }

};
