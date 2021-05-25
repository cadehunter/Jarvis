setLoadingStatus("Adding Event Listeners and Cleaning Up...");

//Use devtools-detect to respond to the opening of developer tools. Trigger the same function if it is already open when this script is run.
if (window.devtools.isOpen) {
    developerToolsOpen();
}

window.addEventListener("devtoolschange", function (e) {
    if (e.detail.isOpen) {developerToolsOpen()}
})