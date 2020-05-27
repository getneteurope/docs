/**
 * This is the place to put all fixes required for wacky/outdated browsers
 * like Safari, IE
 * NOTE: This needs a JS transpiler to work in IE. Use e.g. Babel
 */

var isIE = /MSIE|Trident|Edge\//.test(window.navigator.userAgent);
var isSafariDesktop = (/Safari/i.test(window.navigator.userAgent)
    && /Apple Computer/.test(navigator.vendor))
var isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream

function swapSVGandPNG() {
    document.querySelectorAll('img').forEach((img) => {
        requestIdleCallback(() => {
            img.src = img.src.replace(new RegExp('\.svg$'), '.png');
        });
    });
}

/**
 * Load fixes at DOMContentLoaded and call this again on every pageSwitch
 */
function loadBrowserFixes() {
    switch (true) {
        case isIE:
            swapSVGandPNG();
            break;

        case isSafariDesktop:
            break;

        case isIOS:
            break;

        default:
            break;
    }
}

document.addEventListener('DOMContentLoaded', loadBrowserFixes);
