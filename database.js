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

    }

};
