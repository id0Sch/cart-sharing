window.addEvent("domready", function () {
    // Option 1: Use the manifest:
    new FancySettings.initWithManifest(function (settings) {
        settings.manifest.saveButton.addEvent("action", function () {
            chrome.extension.getBackgroundPage().window.location.reload();
        });
    });
});
