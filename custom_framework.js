let config;
let URL_ = "";
let customElementTagsAndCode = [];
async function run() {
    config = JSON.parse(await get("config.json"));
    customElementsSetup();
    goTo(config.homePage);
    activate();
}
async function customElementsSetup() {
    for (const tag of config.customElementCollection) {
        const code = await get(`elements/${tag}.js`);
        injectJS(code + `${tag}.tags.forEach(tag => {customElementTagsAndCode.push(tag)})`
            , tag + "_JS");
    }
}
run();
function injectHTML(html) {
    let page = document.querySelector("page");
    page.innerHTML = html;
}

function activate() {
    // Process the document body and all its descendants
    processElementAndChildren(document.body);
}

function processElementAndChildren(element) {
    // Process this element if it matches any of our custom tags
    processElement(element);

    // Recursively process all child elements
    for (let i = 0; i < element.children.length; i++) {
        processElementAndChildren(element.children[i]);
    }
}

function processElement(element) {
    // Check built-in elements
    for (const tag of builtInElements) {
        if (element.tagName.toLowerCase() === tag.tag.toLowerCase()) {
            tag.code(element);
            return; // Stop after first match
        }
    }

    // Check custom elements
    for (const tag of customElementTagsAndCode) {
        if (element.tagName.toLowerCase() === tag.tag.toLowerCase()) {
            tag.code(element);
            return;
        }
    }
}
async function get(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Error fetching data:", url, error);
        throw error;
    }
}
async function goTo(url) {
    const htmlCode = await get(`${config.pageDirectory}/${url}/${url}.html`);
    try {
        const jsCode = await get(`${config.pageDirectory}/${url}/${url}.js`);
        if (jsCode && document.getElementById(url + "_JS") == undefined) {
            injectJS(jsCode, url + "_JS");
        }
    } catch (error) {
        if (config.debug) {
            console.log(`No JS file found for ${url}`);
        }
    }
    try {
        const CSSCode = await get(`${config.pageDirectory}/${url}/${url}.css`);
        if (CSSCode && document.getElementById(url + "_CSS") == undefined) {
            injectCSS(CSSCode, url + "_CSS");
        }
    } catch (error) {
        if (config.debug) {
            console.log(`No CSS file found for ${url}`);
        }
    }
    if (config.debug) {
        console.log(htmlCode);
    }
    URL_ = url;
    injectHTML(htmlCode);
    activate();
}
async function injectJS(code, id = undefined) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = code;
    script.id = id;
    document.head.appendChild(script);
}
const builtInElements = [
    {
        "tag": "if",
        "code": ifElement
    },
    {
        "tag": "inlineJS",
        "code": inlineJS
    },
    {
        "tag": "weblink",
        "code": weblink
    },
    {
        "tag": "padding",
        "code": padding
    },
    {
        "tag": "loadCode",
        "code": loadCode
    }
];
let customElements;

// functions voor de built in elements
async function inlineJS(element) {
    const innerhtml = element.innerHTML;
    if (element.getAttribute("preload")) {
        element.innerHTML = element.getAttribute("preload");
    }
    if (element.getAttribute("async") == "true") {
        const code = `
    async function inlinecode(self) {
        ${innerhtml.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')}
    }
    `;
        injectJS(code, "inlineJSCode");
        element.innerHTML = await inlinecode(element);
    } else {
        const code = `
    function inlinecode(self) {
        ${innerhtml.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')}
    }
    `;
        injectJS(code, "inlineJSCode");
        element.innerHTML = inlinecode(element);
    }
    changeTag(element, "span");
    activate();
    document.getElementById("inlineJSCode").remove();
    return element;
}
function weblink(element) {
    const anchorElement = changeTag(element, "a");
    const url = element.getAttribute("href");
    anchorElement.href = `javascript:goTo('${url}')`;
}
async function loadCode(element) {
    let Loadurl = element.getAttribute("url");
    Loadurl = `${config.pageDirectory}/${URL_}/${Loadurl}.js`;
    const code = await get(Loadurl);
    injectJS(code, "loadCodeCode");
    element.remove();
}
function padding(element) {
    const divElement = changeTag(element, "div");
    divElement.style.padding = "10px";
    return divElement;
}

function changeTag(element, newTagName) {
    if (!element) return null;
    const newElement = document.createElement(newTagName);
    [...element.attributes].forEach(attr => newElement.setAttribute(attr.name, attr.value));
    newElement.innerHTML = element.innerHTML;
    element.parentNode.replaceChild(newElement, element);
    return newElement;
}
function injectCSS(code, id = undefined) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = code;
    if (id) style.id = id;
    document.head.appendChild(style);
}
function ifElement(element) {
    const code = element.getAttribute("if");
    if (eval(code)) {
        return element;
    } else {
        element.remove();
        return null;
    }
}