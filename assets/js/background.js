chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace == 'local') return true;
    for (key in changes) {
        var storageChange = changes[key];
        if (typeof storageChange.oldValue == 'undefined' && !_markJun_.checkExist(storageChange.newValue)) {
            _markJun_.getFromBae('getPriceInfo', {
                url: storageChange.newValue
            });
        } else if (typeof storageChange.newValue == 'undefined') {
            _markJun_.delUrl(storageChange.oldValue)
        }
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    var url = _markJun_.checkValid(request.u);
    if (!url) return;
    _markJun_.tabid = sender.tab.id;
    switch (request.ope) {
        case 'addUrl':
            _markJun_.addUrl(url);
            _markJun_.stat(101);
            break;
        case 'checkExist':
            var res = _markJun_.checkExist(url);
            if (res === false) return false;
            if (res) chrome.tabs.sendMessage(_markJun_.tabid, {
                ope: "added"
            });
            else chrome.tabs.sendMessage(_markJun_.tabid, {
                ope: "new"
            });
            break;
        case 'delUrl':
            _markJun_.delUrl(url);
            _markJun_.stat(103);
            break;
        default:
            res = 'Unexpected Action.';
            break;
    }
});

_markJun_.createContextMenus();
chrome.runtime.onInstalled.addListener(function() {
    _markJun_.stat(100);
});
window.setInterval(_markJun_.updateInfo, 600000);
window.setTimeout(_markJun_.updateInfo, 5000);
