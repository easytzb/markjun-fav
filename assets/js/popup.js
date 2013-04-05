(function($) {
    var conArrs = ['timeSort', 'priceFilter', 'siteFilter'];
    var conDefault = ['ctime', 'all', 'all'];
    for (var k in conArrs) window[conArrs[k]] = localStorage[conArrs[k]] || conDefault[k];
    window.getHtml = function() {
        var _OFFLINE_ = "&#24050;&#19979;&#26550;";
        var htmlString = "",
        urlArr = [],
        i = 0;
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var tmp = JSON.parse(localStorage[key]);
            var priceChange = chrome.extension.getBackgroundPage()._markJun_.downOrUp(tmp);
            if (window.priceFilter != 'all' && window.priceFilter != priceChange) {
                continue
            }
            var reg = /.+?\.(.+?)\./.exec(tmp.u);
            if (reg[1] == 'jd') reg[1] = '360buy';
            if (window.siteFilter != 'all' && window.siteFilter != reg[1]) {
                continue
            }
            tmp.pc = priceChange;
            tmp.from = chrome.extension.getBackgroundPage()._markJun_._from_[reg[1]];
            urlArr[i++] = tmp
        };
        urlArr.sort(function(a, b) {
            return a[window.timeSort] > b[window.timeSort] ? -1: 1
        });
        window.is2nd = window.is2nd || 0;
        i = 0;
        for (var key in urlArr) {
            var url = urlArr[key].u;
            var color = chrome.extension.getBackgroundPage()._markJun_.getColor(urlArr[key]);
            var divImg = '<div class="imgcontainer"><img class="viewbutton" src="' + urlArr[key].i + '"></div>';
            var divName = '<div class="businessname viewbutton" title="' + urlArr[key].t + '">' + urlArr[key].t + '</div>';
            var divFrom = '<div class="locationname viewbutton" style="' + color + '">' + chrome.extension.getBackgroundPage()._markJun_.timeString(urlArr[key].utime) + ' \u6765\u81ea ' + urlArr[key].from + '</div>';
            var divButton = '<div class="buttoncontainer"><a class="kd-button kd-menubutton" style="-webkit-user-select: none;float:left;' + color + '" href="' + url + '"><span class="kd-disclosureindicator">' + (urlArr[key].o == 1 ? _OFFLINE_: ('&#65509; ' + urlArr[key].p + (urlArr[key].v ? (' <span class="green">|</span> ' + urlArr[key].v + ' (VIP)') : ''))) + '</span></a></div>';
            var delButton = '<div class="del" data="' + url + '"><img src="assets/images/delete.jpg" /></div>';
            var goButton = '<a class="kd-button kd-menubutton kd-button-submit viewbutton" href="' + url + '">GO</a>';
            var product = '<li class="product">' + divImg + divName + divFrom + divButton + goButton + delButton + '</li>';
            if (++i < 7 && window.is2nd) continue;
            htmlString += product;
            if (!window.is2nd && i == 6) break
        }
        if (window.is2nd) {
            $('#products').append(htmlString);
            window.is2nd = 0
        } else {
            window.is2nd = 1;
            return htmlString
        }
    };
    function filterShow() {
        for (var k in conArrs) {
            var data = window[conArrs[k]];
            var _this = $('.fR-list[key="' + conArrs[k] + '"] a[data="' + data + '"]');
            if (data == 'all') {
                $(_this).parent().parent().hide().parent().css('text-align', 'center').find('div').remove().end().find('.fR-text,.f-ico-triangle-rb').show()
            } else {
                $(_this).parent().parent().hide().parent().css('text-align', 'right').find('div').remove().end().find('.fR-text,.f-ico-triangle-rb').hide().end().prepend("<div>" + $(_this).html() + "</div>")
            }
        }
    }
    $(function() {
        filterShow();
        $('.fR-list a').click(function() {
			var kNum = {
				'timeSortutime':0,
				'timeSortctime':1,
				'priceFilterup':2,
				'priceFilterdown':3,
				'priceFilterall':4,
				'siteFiltertaobao':5,
				'siteFiltertmall':6,
				'siteFiltervancl':7,
				'siteFilter360buy':8,
				'siteFilterall':9
			};
            var key = $(this).parent().parent().attr('key');
            var val = $(this).attr('data');
            window[key] = val;
			chrome.extension.getBackgroundPage()._markJun_.stat(15 + kNum[key+val]);
            filterShow();
            if (localStorage[key] == val) return false;
            localStorage[key] = val;
            if (window.to) {
                clearTimeout(window.to);
                window.is2nd = 0
            }
            $('#products').html(getHtml());
            window.to = window.setTimeout(getHtml, 1000);
            return false
        });
        $('.fRange').mouseover(function() {
            $(this).find('.fR-list').show()
        }).mouseout(function() {
            $(this).find('.fR-list').hide()
        });
        $('#products').append(getHtml());
        window.to = window.setTimeout(getHtml, 1000);
        if (chrome.extension.getBackgroundPage()._markJun_.getChangedProduct().length == 0) {
            $('#notify_up').hide()
        }
        chrome.extension.getBackgroundPage()._markJun_.stat(4);
        $('#notify_test').click(function() {
            chrome.extension.getBackgroundPage()._IS_DEFAULT_ = true;
            chrome.extension.getBackgroundPage()._markJun_.stat(9);
            chrome.extension.getBackgroundPage()._markJun_.showNotify()
        });
        $('#notify_up').click(function() {
            chrome.extension.getBackgroundPage()._SHOW_BY_USER_ = true;
            chrome.extension.getBackgroundPage()._markJun_.stat(10);
            chrome.extension.getBackgroundPage()._markJun_.showNotify()
        });
        $('.imgcontainer').live('click', 
        function() {
            chrome.extension.getBackgroundPage()._markJun_.stat(8);
            chrome.tabs.create({
                'url': $(this).parent().find('a').attr('href'),
                active: false
            })
        });
        $('.kd-button-submit').live('click', 
        function() {
            chrome.extension.getBackgroundPage()._markJun_.stat(14);
            chrome.tabs.create({
                'url': $(this).attr('href'),
                active: false
            })
        });
        $('.del').live('click', 
        function() {
            chrome.extension.getBackgroundPage()._markJun_.stat(3);
            chrome.extension.getBackgroundPage()._markJun_.delUrl($(this).attr('data'));
            $(this).parents('.product').remove();
            return false
        })
    })
})(jQuery);