setLoadingStatus("Checking for Speech Support...");

if ("speechSynthesis" in window) {

} else {

    //Speech synthesis is not supported
    setLoadingStatus("Speech Synthesis not supported.")

}

setLoadingStatus("Initializing Speech Synthesis Engine...");

var speechSynthesisEngine = {

    isSpeaking: false,

    preferredVoiceURI: undefined,

    queue: {

        queueIsExecuting: false,
        executeQueue: function () {

            //Make sure the queue isn't already executing. If it is, return this execution so as not to be redundant and cause issues.
            if (this.queueIsExecuting) {
                return;
            }

            this.queueIsExecuting = true;

            function executeItemSpeak() {
                if (speechSynthesisEngine.queue.spokenItemQueue.length >= 1) {
                    speechSynthesisEngine.speakItem(speechSynthesisEngine.queue.spokenItemQueue[0], executeItemSpeak);
                    speechSynthesisEngine.queue.spokenItemQueue.shift();
                } else {
                    speechSynthesisEngine.queue.queueIsExecuting = false;
                }
            }
            executeItemSpeak();

        },

        spokenItemQueue: [],
        add: function (item) {

            //If the item is urgent, add it to the beginning of the queue. Otherwise, add it to the end.
            if (item.priority == "urgent") {
                this.spokenItemQueue.unshift(item);
            } else {
                this.spokenItemQueue.push(item);
            }

            //If the queue isn't executing already, execute it now.
            if (!this.queueIsExecuting) {
                this.executeQueue();
            }

        },
        remove: function (itemID) {

        }

    },

    speakResultOfIntent: function (possibleResults, priority, context) {

        //If this output requests a context assignment, assign it now
        if (context) {
            languageProcessingEngine.currentContext = context;
        }
        this.queue.add({
            priority: priority || "normal",
            message: languageProcessingEngine.filterOutput(chooseFrom(possibleResults)),
        });
    },

    speakItem: function (item, callback) {

        this.isSpeaking = true;

        var speechUtterance = new SpeechSynthesisUtterance();
        speechUtterance.text = item.message;
        speechUtterance.voice = this.preferredVoiceURI;
        speechUtterance.rate = 0.8;
        speechUtterance.onend = function () {
            setTimeout(callback, 500);
            speechSynthesisEngine.isSpeaking = false;
            speechRecognitionEngine.startRecognition();
        };
        window.speechSynthesis.speak(speechUtterance);
        console.log("Speaking now: " + item.message);
        if (item.callback) {
            item.callback();
        }

    },

    pronouns: {

        userGender: "male",

        getDirectAddress: function () {
            if (this.userGender == "male") {
                return "sir";
            } else {
                return "ma'am";
            }
        },
        getThirdPersonSubject: function () {
            if (this.userGender == "male") {
                return "he";
            } else {
                return "she";
            }
        },
        getThirdPersonObject: function () {
            if (this.userGender == "male") {
                return "him";
            } else {
                return "her";
            }
        },
        getThirdPersonPossessive: function () {
            if (this.userGender == "male") {
                return "his";
            } else {
                return "her";
            }
        }

    }

}

function setPreferredSpeechSynthesisVoice() {
    
    //Get window.speechSynthesis voices and choose the best one.
    var speechSynthesisVoices = speechSynthesis.getVoices();
    var preferredVoiceURIs = [
        "com.apple.speech.synthesis.voice.oliver.premium",
        "com.apple.speech.synthesis.voice.oliver",
        "Microsoft Mia Online (Natural) - English (United Kingdom)",
        "com.apple.speech.synthesis.voice.Alex.premium",
        "com.apple.speech.synthesis.voice.Alex",
        "Alex"
    ];

    for (var i = 0; i < preferredVoiceURIs.length; i++) {
        for (var ii = 0; ii < speechSynthesisVoices.length; ii++) {

            if (speechSynthesisVoices[ii].voiceURI == preferredVoiceURIs[i]) {

                speechSynthesisEngine.preferredVoiceURI = speechSynthesisVoices[ii];
                break;

            }

        }

        //If the interior loop resulted in a match, we don't need to look for any more voices.
        if (speechSynthesisEngine.preferredVoiceURI) {
            break;
        }
    }
    
}
if (speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", setPreferredSpeechSynthesisVoice);
setPreferredSpeechSynthesisVoice();

setLoadingStatus("Initializing Speech Recognition Engine...");

var speechRecognitionEngine = {

    startRecognition: function () {

        var recognitionObject = new window.webkitSpeechRecognition() || new window.webkitSpeechRecognition();

        recognitionObject.onstart = function () {
            console.log("Voice recognition active.");
        };

        recognitionObject.onresult = function (event) {
            var transcript = event.results[0][0].transcript;
            console.log("Heard: " + transcript);
            languageProcessingEngine.processInput(event);

            //If this is the final result
            if (event.results[0].isFinal) {
                languageProcessingEngine.settledOnResult = false;
                if (!speechSynthesisEngine.isSpeaking) {
                    speechRecognitionEngine.startRecognition();
                }
            }
        };

        recognitionObject.interimResults = true;
        recognitionObject.start();

    }

}

setLoadingStatus("Initializing Language Processing Engine...");

var languageProcessingEngine = {

    latestRawInput: undefined,
    settledOnResult: false,

    currentContext: {

        name: undefined,
        persistent: false,
        information: undefined,

    },

    processInput: function (rawEvent) {

        this.latestRawInput = rawEvent.results[0][0].transcript;
        return this.matchInput(this.filterInput(rawEvent.results[0][0].transcript), rawEvent);

    },

    filterInput: function (input) {

        //pre-filter #1 - Capitalization
        input = input.toLowerCase();

        //pre-filter #3 - Punctuation
        input = input.replace(/,/g, "");
        input = input.replace(/\!/g, "");
        input = input.replace(/\?/g, "");

        //filter #1 - Contractions
        input = input.replace(/it's/g, "it is");
        input = input.replace(/let's/g, "let us");
        input = input.replace(/don't/g, "do not");
        input = input.replace(/can't/g, "can not");
        input = input.replace(/won't/g, "will not");

        //filter #2 - Politeness
        input = input.replace(/please/g, "");
        input = input.replace(/will you/g, "");
        input = input.replace(/jarvis/g, "");

        //post-filter #1 - Leading and trailing whitespace
        input = input.trim();

        input = " " + input + " ";

        return input;

    },
    matchInput: function (filteredInput, rawEvent) {

        var possibleIntentsKeys = Object.keys(languageProcessingDatabase.dictionary);

        //Loop through all possible intents to find a match
        for (var i = 0; i < possibleIntentsKeys.length; i++) {

            var currentIntent = languageProcessingDatabase.dictionary[possibleIntentsKeys[i]];

            //If this intent requires a context, ensure that that context is active. Otherwise move on to the next possible intent.
            if (currentIntent.requiredContext && !(currentIntent.requiredContext == languageProcessingEngine.currentContext.name)) {
                continue;
            }

            //If this intent requires a final speech result, ensure that this input is final.
            if (currentIntent.requiresFinalResult && !rawEvent.results[0].isFinal) {
                continue;
            }

            //Loop through all input options for this intent
            for (var ii = 0; ii < currentIntent.input.length; ii++) {

                //See if the filtered input is a match for the current input option
                if (filteredInput.search(currentIntent.input[ii]) >= 0) {

                    //If the system hasn't settled on a result, add a delay of half a second. If we have a newer result by then (E.G. the user is still speaking), don't run the result until after that.
                    //An IIFE is used here to prevent currentRawInput from always being a reference to the latest input.
                    if (!languageProcessingEngine.settledOnResult) {
                        
                        (function (currentRawInput) {
                            setTimeout(function () {

                                if (languageProcessingEngine.latestRawInput == currentRawInput) {

                                    languageProcessingEngine.settledOnResult = true;

                                    //If the current context isn't persistent, clear it.
                                    if (!languageProcessingEngine.currentContext.persistent) {
                                        languageProcessingEngine.currentContext = {
                                            name: undefined,
                                            persistent: false,
                                            information: undefined,
                                        };
                                    }
                                    //Run this intent's output function
                                    currentIntent.output({
                                        rawEvent: rawEvent,
                                        rawInput: currentRawInput,
                                        filteredInput: filteredInput,
                                        matchForInput: currentIntent.input[ii]
                                    });

                                }

                            }, 500);
                        })(rawEvent.results[0][0].transcript);
                        
                    }
                    return;

                }

            }

        }

    },

    filterOutput: function (output) {

        //Insert male or female pronouns depending on user
        output = output.replace("&DA", speechSynthesisEngine.pronouns.getDirectAddress());
        output = output.replace("&TPS", speechSynthesisEngine.pronouns.getThirdPersonSubject());
        output = output.replace("&TPO", speechSynthesisEngine.pronouns.getThirdPersonObject());
        output = output.replace("&TPP", speechSynthesisEngine.pronouns.getThirdPersonPossessive());

        return output;

    }

}

setLoadingStatus("Starting Speech Recognition...");

speechRecognitionEngine.startRecognition();
