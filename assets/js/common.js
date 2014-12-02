var _markJun_ = {
    backend: 'http://127.0.0.1:89/',
    //backend: 'http://markjun.duapp.com/',
    validUrls: [/^(http\:\/\/www\.360buy\.com\/product\/\d+\.html).*$/i, /^(http\:\/\/.*?\.360buy\.com\/\d+\.html).*$/i, /^(http\:\/\/www\.jd\.com\/product\/\d+\.html).*$/i, /^(http\:\/\/.*?\.jd\.com\/\d+\.html).*$/i, /^(http\:\/\/item\.taobao\.com\/item\.htm\?(.*?)id\=\d+).*?$/i, /^(http\:\/\/wt\.taobao\.com\/detail\.html?\?(.*?)id\=\d+).*?$/i, /^(http\:\/\/detail\.tmall\.com\/venus\/spu_detail\.htm\?(.*?)spu_id\=\d+(.*?)\&mallstItemId\=\d+).*?$/i, /^(http\:\/\/detail\.tmall\.com\/item\.htm\?(.*?)id\=\d+).*?$/i, /^(http:\/\/item\.vancl\.com\/\d+\.html).*/i, /^(http:\/\/item\.vjia\.com\/\d+\.html).*/i, /^(http:\/\/item\.vt\.vancl\.com\/\d+\.html).*/i, /^(http:\/\/www\.amazon\.cn\/(.*?)dp\/[A-Z0-9]+?)($|\/.*$)/i, /^(http:\/\/www\.amazon\.cn\/gp\/product\/[A-Z0-9]+?)($|\/.*$)/i, /^(http:\/\/product\.suning\.com\/[0-9\/]+\.html).*/i, /^(http:\/\/www\.suning\.com\/emall\/[sc]prd\_.+)/i],
    _from_: {
        '360buy': '京东',
        'jd': '京东',
        'taobao': '淘宝',
        'tmall': '天猫',
        'vancl': '凡客',
        'vt': '凡客',
        'vjia': '凡客',
        'suning': '苏宁',
        'amazon': '亚马逊'
    },
    productStat: {
        soldOut: 0x4,
        restock: 0x2,
        priceUp: 0x40,
        priceDown: 0x20,
        vpriceUp: 0x10,
        vpriceDown: 0x8,
        isOff: 0x1,
    },
    productChar: {
        soldOut: '○',
        restock: '●',
        priceUp: '↗',
        priceDown: '↘',
        vpriceUp: 'V↗',
        vpriceDown: 'V↘',
        isOff: '',
    },
    productColor: {
        soldOut: 'color:#999;',
        restock: 'color:green;',
        priceUp: 'color:#ccc;',
        priceDown: 'color:green;',
        vpriceUp: 'color:#ccc;',
        vpriceDown: 'color:green;',
        isOff: 'color:#999;',
    },
    contextMenusId: 0,
    getKey: function(url) {
        return "data_" + Crypto.MD5(url);
    },
    tabid: 0,
    updateCount: 0,
    totalCount: 0,
    notifyId: null,
    checkValid: function(url) {
        for (var k in this.validUrls) {
            var reg = this.validUrls[k];
            if ((reg = reg.exec(url)) && reg[1]) {
                for (var j in reg) {
                    if (j < 2) continue;
                    if (isNaN(parseInt(j))) break;
                    reg[1] = reg[1].replace(reg[j], '');
                }
                res = reg[1].replace('item.vt.vancl', 'item.vancl');
                res = res.replace('zon.cn/dp', 'zon.cn/gp/product');
                return res;
            }
        }
        return false;
    },
    getProductInfo: function(url) {
        var url = this.checkValid(url);
        if (!url) return false;
        return JSON.parse(localStorage.getItem(this.getKey(url)))
    },
    saveUrl: function(param) {
        if (param.p) param.p = parseFloat(param.p);
        if (param.op) param.op = parseFloat(param.op);
        if (param.v) param.v = parseFloat(param.v);
        if (param.ov) param.ov = parseFloat(param.ov);
        if (!param.ctime) param.ctime = new Date().valueOf();
        if (!param.utime) param.utime = new Date().valueOf();
        localStorage.setItem(this.getKey(param.u), JSON.stringify(param));
        return true
    },
    addUrl: function(url) {
        var url = this.checkValid(url);
        if (!url) return false;
        chrome.storage.sync.set(JSON.parse('{"' + _markJun_.getKey(url) + '": "' + url + '"}'));
        _markJun_.getFromBae('getPriceInfo', {
            url: url
        });
        return true;
    },
    delUrl: function(url) {
        chrome.storage.sync.remove(_markJun_.getKey(url));
        var url = this.checkValid(url);
        if (!url) return false;
        localStorage.removeItem(this.getKey(url));
        chrome.tabs.sendMessage(_markJun_.tabid, {
            ope: "deleted"
        });
        return true
    },
    editUrl: function(url, data) {
        var old = this.getProductInfo(url) || {};
        for (var k in data) old[k] = data[k];
        return this.saveUrl(old)
    },
    getChangeCode: function(info) {
        var code = 0;
        if (info.otime)
            code |= (info.o == 1 ? this.productStat.soldOut : this.productStat.restock);

        if (info.ptime) {
            var oldPrice = parseFloat(info.op);
            var newPrice = parseFloat(info.p);
            if (oldPrice > newPrice) code |= this.productStat.priceDown;
            else if (oldPrice < newPrice) code |= this.productStat.priceUp;
        }

        if (info.vtime) {
            var oldPrice = parseFloat(info.ov);
            var newPrice = parseFloat(info.v);
            if (oldPrice > newPrice) code |= this.productStat.vpriceDown;
            else if (oldPrice < newPrice) code |= this.productStat.vpriceUp;
        }

        if (info.o) code |= this.productStat.isOn;

        return code;
    },
    clearChangedInfoByUrl: function(url) {
        _markJun_.editUrl(url, {
            op: null,
            ptime: null,
            otime: null,
            vtime: null,
            ov: null
        })
    },
    clearChangedInfo: function() {

        if (this.notifyId) chrome.notifications.clear(this.notifyId, function(wasCleared) {
            console.log(wasCleared)
        });
        this.notifyId = null;
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var info = JSON.parse(localStorage[key]);
            if (info.otime || info.ptime || info.vtime) {
                _markJun_.editUrl(info.u, {
                    op: null,
                    ptime: null,
                    otime: null,
                    vtime: null,
                    ov: null
                })
            }
        }
    },
    openProduct: function() {
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var info = JSON.parse(localStorage[key]);
            if (info.otime || info.ptime || info.vtime) {
                chrome.tabs.create({
                    url: info.u
                });
            }
        }
    },
    getChangeColor: function(changeCode) {
        if (!(changeCode >> 1 << 1)) return '';

        if (changeCode & this.productStat.isOff)
            color = this.productColor.isOff;
        else if (changeCode & this.productStat.vpriceUp)
            color = this.productColor.vpriceUp;
        else if (changeCode & this.productStat.vpriceDown)
            color = this.productColor.vpriceDown;
        else if (changeCode & this.productStat.priceUp)
            color = this.productColor.priceUp;
        else if (changeCode & this.productStat.priceDown)
            color = this.productColor.priceDown;
        else if (changeCode & this.productStat.restock)
            color = this.productColor.restock;
        else color = '';

        return color;
    },
    getChangeStrPre: function(changeCode) {
        changeCode = changeCode >> 1 << 1;
        if (!(changeCode)) return '';

        var str = "";
        for (k in this.productStat) {
            if (changeCode & this.productStat[k])
                str += this.productChar[k];
        }
        return str;
    },
    checkExist: function(url) {
        return this.getProductInfo(url)
    },
    getFromBae: function(act, praram) {
        praram.act = act;
        praram._ = (new Date()).valueOf();
        var successFunction = act + 'Success';

        $.ajax({
            url: this.backend,
            data: praram,
            success: _markJun_[successFunction]
        })
    },

    getPriceInfoSuccess: function(data) {
        _markJun_.updateCount++;
        if (!data) return;
        if (!(data = JSON.parse(data))) return;
        if (!data.t || !data.i || !data.u) return;

        if (_markJun_.checkExist(data.u)) {
            var oInfo = _markJun_.getProductInfo(data.u);
            if (typeof oInfo.o != 'undefined' && parseFloat(oInfo.o) != parseFloat(data.o)) {
                data.otime = new Date().valueOf();
                data.utime = new Date().valueOf()
            }
            if (typeof oInfo.p != 'undefined' && parseFloat(oInfo.p) != parseFloat(data.p)) {
                data.ptime = new Date().valueOf();
                data.utime = new Date().valueOf();
                data.op = oInfo.p
            }
            if (typeof oInfo.v != 'undefined' && parseFloat(oInfo.v) != parseFloat(data.v)) {
                data.vtime = new Date().valueOf();
                data.utime = new Date().valueOf();
                data.ov = oInfo.v
            }
            _markJun_.editUrl(oInfo.u, data);
            if (_markJun_.updateCount == _markJun_.totalCount) {
                _markJun_.showNotify();
                _markJun_.updateCount = _markJun_.totalCount = 0
            }
        } else {
            _markJun_.saveUrl(data);
            chrome.tabs.sendMessage(_markJun_.tabid, {
                ope: "added"
            })
        }
    },

    stat: function(type, value) {
        var value = value || 0;
        $.ajax({
            url: this.backend,
            data: {
                v: value,
                t: encodeURIComponent(type),
                appid: chrome.i18n.getMessage('@@extension_id'),
                '_': (new Date()).valueOf()
            }
        })
    },

    timeString: function(time) {
        var diff = parseInt(((new Date()).valueOf() - time) / 1000),
            str = '';
        if (diff < 0) str = "刚刚的";
        else if (diff < 60) str = diff + " 秒前";
        else if (diff >= 60 && diff < 3600) str = parseInt(diff / 60) + " 分前";
        else if (diff >= 3600 && diff < 86400) str = parseInt(diff / 3600) + " 小时前";
        else if (diff >= 86400 && diff < 86400 * 7) str = parseInt(diff / 86400) + " 天前";
        else if (diff >= 86400 * 7 && diff < 86400 * 30) str = parseInt(diff / 86400 / 7) + " 周前";
        else if (diff >= 86400 * 30 && diff < 86400 * 365) str = parseInt(diff / 86400 / 30) + " 月前";
        else str = parseInt(diff / 86400 / 365) + " 年前";
        return str + '变动'
    },
    showNotify: function() {
        var items = new Array();
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;

            var info = JSON.parse(localStorage[key]);

            var changeCode = this.getChangeCode(info);
            if (!(changeCode >> 1 << 1)) continue;

            var title = this.getChangeStrPre(changeCode);
            items.push({
                title: (title + ':' + info.t),
                message: ''
            })
        }

        if (!items.length) return false;
        _markJun_.stat(109);

        var opt = {
            type: "list",
            title: "变动的商品",
            message: "zero",
            iconUrl: "assets/images/logo-128-bgwhite.png",
            items: items,
            //eventTime:Date.now() + 1000,
            isClickable: true,
            buttons: [{
                title: '打开(所有)变动商品',
                iconUrl: 'assets/images/checkmark.png'
            }, {
                title: '忽略(所有)变动商品',
                iconUrl: 'assets/images/cancel.png'
            }]
        };

        chrome.notifications.create(_markJun_.notifyId ? _markJun_.notifyId : "", opt, function(notifyId) {
            _markJun_.notifyId = notifyId;
        });

    },
    updateInfo: function() {
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var info = JSON.parse(localStorage[key]);
            var info = info.u;
            _markJun_.getFromBae('getPriceInfo', {
                url: info
            });
            _markJun_.totalCount++
        }
    },
    echo: function(str) {
        console.log(str)
    },
    addListener: function() {
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

        chrome.notifications.onButtonClicked.addListener(function(nid, index) {
            if (nid != _markJun_.notifyId) return;
            if (0 == index) {
                _markJun_.stat(110);
                _markJun_.openProduct();
            } else _markJun_.stat(111);
            _markJun_.clearChangedInfo();
        });

        chrome.notifications.onClosed.addListener(function(nid, byUser) {
            if (nid != _markJun_.notifyId) return;
            _markJun_.notifyId = null;
            if (byUser) _markJun_.stat(112);
        })

        chrome.runtime.onInstalled.addListener(function() {
            _markJun_.stat(100);
        });
    },
    documentUrlPatterns: ["http://item.vjia.com/*.html*", "http://www.360buy.com/product/*.html*", "http://*.360buy.com/*.html*", "http://www.jd.com/product/*.html*", "http://*.jd.com/*.html*", "http://item.taobao.com/item.htm*id=*", "http://wt.taobao.com/detail.html*id=*", "http://detail.tmall.com/venus/spu_detail.htm*spu_id=*mallstItemId=*", "http://detail.tmall.com/item.htm*id*", "http://item.vancl.com/*.html*", "http://item.vt.vancl.com/*.html*", "http://www.amazon.cn/*dp*", "http://www.amazon.cn/gp/product/*", "http://www.suning.com/emall/sprd_*", "http://www.suning.com/emall/cprd_*", "http://product.suning.com/0*.html*"],
    createContextMenus: function() {
        _markJun_.contextMenusId = chrome.contextMenus.create({
            "documentUrlPatterns": _markJun_.documentUrlPatterns,
            "title": "mark君·网购收藏夹",
            "contexts": ["page"],
            'onclick': function(info, tab) {
                url = tab.url;
                res = _markJun_.checkExist(url);
                if (res === false) return false;
                if (res) {
                    chrome.tabs.sendMessage(tab.id, {
                        ope: "new"
                    });
                    _markJun_.delUrl(url);
                    _markJun_.stat(105);
                } else {
                    chrome.tabs.sendMessage(tab.id, {
                        ope: "added"
                    });
                    _markJun_.addUrl(url);
                    _markJun_.stat(102);
                }

            }
        });
    }
};
