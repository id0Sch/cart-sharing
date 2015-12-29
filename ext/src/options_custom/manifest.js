// SAMPLE
this.manifest = {
    "name": "Cart sharing",
    "icon": "/icon.png",
    "settings": [
        {
            "tab": i18n.get("connection"),
            "group": i18n.get("connection"),
            "name": "server",
            "type": "text",
            "label": i18n.get("server"),
            "text": i18n.get("x-characters")
        },
        {
            "tab": i18n.get("connection"),
            "name": "saveButton",
            "type": "button",
            "text": i18n.get("save")
        }
    ],
    "alignment": [
        [
            "server"
        ]
    ]
};
