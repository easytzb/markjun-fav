var _markJun_ = {
    validUrls: [/^(http\:\/\/www\.360buy\.com\/product\/\d+\.html).*$/i, /^(http\:\/\/.*?\.360buy\.com\/\d+\.html).*$/i, /^(http\:\/\/www\.jd\.com\/product\/\d+\.html).*$/i, /^(http\:\/\/.*?\.jd\.com\/\d+\.html).*$/i, /^(http\:\/\/item\.taobao\.com\/item\.htm\?(.*?)id\=\d+).*?$/i, /^(http\:\/\/wt\.taobao\.com\/detail\.html?\?(.*?)id\=\d+).*?$/i, /^(http\:\/\/detail\.tmall\.com\/venus\/spu_detail\.htm\?(.*?)spu_id\=\d+(.*?)\&mallstItemId\=\d+).*?$/i, /^(http\:\/\/detail\.tmall\.com\/item\.htm\?(.*?)id\=\d+).*?$/i, /^(http:\/\/item\.vancl\.com\/\d+\.html).*/i,/^(http:\/\/item\.vt\.vancl\.com\/\d+\.html).*/i],
    _from_: {
        '360buy': '京东',
        'jd': '京东',
        'taobao': '淘宝',
        'tmall': '天猫',
        'vancl': '凡客',
		'vt': '凡客'
    },
    backend: 'http://markjun.duapp.com/',
    numOfNotify: 0,
    getKey: function(url) {
        return "data_" + Crypto.MD5(url)
    },
    tabid: 0,
    updateCount: 0,
    totalCount: 0,
    notifyWindows: [],
    checkValid: function(url) {
        for (var k in this.validUrls) {
            var reg = this.validUrls[k];
            if ((reg = reg.exec(url)) && reg[1]) {
                for (var j in reg) {
                    if (j < 2) continue;
                    if (isNaN(parseInt(j))) break;
                    reg[1] = reg[1].replace(reg[j], '')
                }
                return reg[1]
            }
        }
        return false
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
    getChangedProduct: function() {
        var data = [];
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var info = JSON.parse(localStorage[key]);
            if (info.otime || info.ptime || info.vtime) {
                info.color = this.getColor(info);
                info.changeStr = this.changeString(info);
                data[data.length] = info
            }
        }
        return data
    },
    clearChangedInfo: function() {
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
                chrome.tabs.create({url: info.u});
            }
        }
    },
    downOrUp: function(info) {
        info.op = parseFloat(info.op);
        info.p = parseFloat(info.p);
        info.v = parseFloat(info.v);
        info.ov = parseFloat(info.ov);
        if (info.ptime) {
            if (info.op < info.p) var priceChange = 'up';
            else if (info.op == info.p) var priceChange = '=';
            else if (info.op > info.p) var priceChange = 'down'
        } else if (info.vtime) {
            if (info.ov < info.v) var priceChange = 'up';
            else if (info.ov == info.v) var priceChange = '=';
            else if (info.ov > info.v) var priceChange = 'down'
        } else var priceChange = null;
        return priceChange
    },
    getColor: function(info) {
        info.pc = info.pc || this.downOrUp(info);
        if (info.ptime || info.vtime || info.otime) {
            if (info.o == 1) var color = 'color:#999;';
            else if (info.pc == 'up') var color = 'color:#ccc;';
            else if (info.pc == 'down') var color = 'color:green;';
            else if (info.otime && info.o == 0) var color = 'color:green;';
            else var color = ''
        } else var color = '';
        return color
    },
    changeString: function(info) {
        var changeStr = "";
        var _OFF_ = 'OFF';
        var _ON_ = 'ON';
        if (info.otime) {
            changeStr += info.o ? _OFF_: _ON_
        }
        var sperator = ' ';
        if (!info.o && info.ptime) {
            changeStr += changeStr?':':'';
            var oldPrice = parseFloat(info.op).toFixed(2);
            var newPrice = parseFloat(info.p).toFixed(2);
            if (oldPrice > newPrice) changeStr += '↓';
            else changeStr += '↑';
        }
        if (!info.o && info.vtime) {
            changeStr += changeStr?':':'';
            var oldPrice = parseFloat(info.ov).toFixed(2);
            var newPrice = parseFloat(info.v).toFixed(2);
            if (oldPrice > newPrice) changeStr += 'V↓';
            else changeStr += 'V↑';
        }
        return changeStr
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
		if (! (data = JSON.parse(data))) return;
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
				appid:chrome.i18n.getMessage('@@extension_id'),
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
        if (!window._IS_DEFAULT_) {
            var notNotify = true;
            var items = new Array();
            for (var key in localStorage) {
                if (key.indexOf('data_') !== 0) continue;
                var info = JSON.parse(localStorage[key]);
                if (info.otime || info.ptime || info.vtime) {
                    var title = _markJun_.changeString(info);
                    items.push({title:(title+':'+info.t), message:'mes'})
                }
            }
        }

        if(!items.length) return false;

		var opt = {
			type: "list",
			title: "变动的商品",
			message: "zero",
			iconUrl: "assets/images/icon_128_whitebg.png",
			items: items,
            //eventTime:Date.now() + 1000,
            isClickable:true,
            buttons:[
                {title:'打开(所有)变动商品',iconUrl:'assets/images/checkmark.png'},
                {title:'忽略(所有)变动商品',iconUrl:'assets/images/cancel.png'}
            ]
		};
        var notifyId = null;
		chrome.notifications.create("", opt, function(notificationId) {
			if (chrome.extension.lastError) {
				console.log("create error: " + chrome.extension.lastError.message);
			}
			notifyId = notificationId;
		});
        chrome.notifications.onButtonClicked.addListener(function(nid, index){
            if (nid != notifyId) return;
            if (0 == index) {
                _markJun_.openProduct();
            }
            _markJun_.clearChangedInfo();
        })
    },
    updateInfo: function() {
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var info = JSON.parse(localStorage[key]);
            var info = info.u;
            _markJun_.getFromBae('getPriceInfo', {url:info});
            _markJun_.totalCount++
        }
    },
    echo: function(str) {
        console.log(str)
    },
    clearNotify: function() {
        for (var k in this.notifyWindows) {
            this.notifyWindows[k].cancel()
        }
        this.notifyWindows = []
    }
};
