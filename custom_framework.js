let custom_root = "";
let custom_components = [{
    "name": "custom_component",
    "tag": "custom_component",
    "url": "custom_component",
    "version": "1.0",
    "custom_attributes": ["data"]
}];

function activate() {
    activateCustomComponent();
    activateWeblinks();
    activate_triggers();
}
async function activateWeblinks() {
    try {
        let allLinks = document.querySelectorAll('weblink'); // Select <weblink> tags
        allLinks.forEach(element => {
            let originalLink = element.getAttribute('href'); // Get the original link
            if (originalLink && originalLink !== "") {
                element.setAttribute('href', "javascript:goTo('" + originalLink + "')"); // Set the href to JS function
                element.innerHTML = element.innerHTML; // Transfer inner content of <weblink> to <a>

                changeTag(element, 'a'); // Replace <weblink> with the new <a> tag

            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}
async function activateCustomComponent() {
    try {
        custom_components.forEach(component => {
            let linkTriggers3 = document.querySelectorAll(component.tag);
            linkTriggers3.forEach(async element => {
                let data = await makeRequest(custom_root + component.tag + "/" + component.url + ".html");

                data = data.replaceAll("{{version}}", component.version);
                data = data.replaceAll("{{name}}", component.name);
                component.custom_attributes.forEach(attr => {
                    data = data.replaceAll("{{" + attr + "}}", element.getAttribute(attr));
                });
                element.innerHTML = data;
                changeTag(element, "custom_component_container");
                activate_triggers();

                data = await makeRequest(custom_root + component.tag + "/" + component.url + ".js");

                data = data.replaceAll("{{version}}", component.version);
                data = data.replaceAll("{{name}}", component.name);
                component.custom_attributes.forEach(attr => {
                    data = data.replaceAll("{{" + attr + "}}", element.getAttribute(attr));
                });
                eval(data);
            });

        });
    } catch (error) {
        console.error('Error:', error);
    }
}
async function goTo(url) {
    let config_for_goto = {
        "dynamicPage": false,
        "page_inputs": {
            "has_inputs": false,
            "inputs": []
        },
        "url": url
    };
    let url_as_array = url.split(" ");
    url_as_array.forEach(config => {
        if (config == "--dynamicPage" || config == "-dp") {
            config_for_goto.dynamicPage = true;
            return;
        } else if (config.startsWith("--page_inputs") || config.startsWith("-pi")) {
            config_for_goto.page_inputs.has_inputs = true;
            config_for_goto.page_inputs.inputs.push({
                "name": config.split("=")[1],
                "value": config.split("=")[2]
            });
        } else if (config == "") {
            return;
        }
        else {
            config_for_goto.url = config;
        }
    });

    if (config_for_goto.url) {
        if (config_for_goto.dynamicPage) {
            config_for_goto.url = config_for_goto.url + "/" + config_for_goto.url;
        }

        let html = await makeRequest(custom_root + config_for_goto.url + ".html");

        if (config_for_goto.page_inputs.has_inputs) {
            config_for_goto.page_inputs.inputs.forEach(input => {
                html = html.replaceAll("{" + input.name + "}", input.value);
            });
        }

        if (checkElementExists('body')) {
            document.getElementById('body').innerHTML = html;
        } else {
            document.querySelector('webpage').innerHTML = html;
        }
        activate();

        if (config_for_goto.dynamicPage) {
            let javascript = await makeRequest(custom_root + config_for_goto.url + ".js");
            if (config_for_goto.page_inputs.has_inputs) {
                config_for_goto.page_inputs.inputs.forEach(input => {
                    javascript = javascript.replaceAll("{" + input.name + "}", input.value);
                });
            }
            eval(javascript);
        }
    }
}
function makeCustomComponent(name, tag, url, version, custom_attributes) {
    custom_components.push({
        "name": name,
        "tag": tag,
        "url": url,
        "version": version,
        "custom_attributes": custom_attributes
    });
}
function activate_triggers() {
    try {
        let Triggers = document.querySelectorAll('trigger'); // Select <trigger> tags
        Triggers.forEach(element => {
            eval(element.innerHTML);
            element.remove();
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
// utils
function checkElementExists(id) {
    var element = document.getElementById(id);
    if (element) {
        return true;
    } else {
        return false;
    }
}
async function makeRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
function isMobile() {
    return (window.innerWidth <= 800);
}
function str(non_string) {
    return non_string.toString();
}
function num(non_number) {
    return Number(non_number);
}
function changeTag(element, newTagName) {
    if (!element) return null;

    // Create a new element with the desired tag
    const newElement = document.createElement(newTagName);

    // Copy the attributes from the old element to the new one
    [...element.attributes].forEach(attr => newElement.setAttribute(attr.name, attr.value));

    // Copy the content (if any)
    newElement.innerHTML = element.innerHTML;

    // Replace the old element with the new one
    element.parentNode.replaceChild(newElement, element);

    // Return the new element
    return newElement;
}