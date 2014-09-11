(function($) {
    window.getHtml = function() {
        window._OFFLINE_ = '&#24050;&#19979;&#26550;';
        window._ONLINE_ = '&#24050;&#19978;&#26550;';
        var htmlString = "",
            urlArr = [],
            i = 0;
        for (var key in localStorage) {
            if (key.indexOf('data_') !== 0) continue;
            var tmp = JSON.parse(localStorage[key]);
            var reg = /.+?\.(.+?)\./.exec(tmp.u);
            if (reg[1] == 'jd') reg[1] = '360buy';
            tmp.from = chrome.extension.getBackgroundPage()._markJun_._from_[reg[1]];
            urlArr[i++] = tmp
        };
        urlArr.sort(function(a, b) {
            return a.utime > b.utime ? -1 : 1
        });
        window.is2nd = window.is2nd || 0;
        i = 0;
        for (var key in urlArr) {
            var url = urlArr[key].u;
            var _markJun_ = chrome.extension.getBackgroundPage()._markJun_;
            var changeCode = _markJun_.getChangeCode(urlArr[key]);
            var color = _markJun_.getChangeColor(changeCode);
            var isChanged = changeCode >> 1 << 1;
            var isSoldout = urlArr[key].o == 1;

            var divImg = '<div class="imgcontainer"><img src="' + urlArr[key].i + '"></div>';
            var divName = '<div class="businessname" title="' + urlArr[key].t + '">' + urlArr[key].t + '</div>';
            var divFrom = '<div class="locationname" style="' + color + '">' + chrome.extension.getBackgroundPage()._markJun_.timeString(urlArr[key].utime) + ' \u6765\u81ea ' + urlArr[key].from + '</div>';

            var priceButton = '<div class="buttoncontainer">';
            if (isSoldout) {
                priceButton += '<a class="kd-button" href="' + url + '"><span style="' + color + '">' + _OFFLINE_ + '</span></a>';                
            } else {
                priceButton += '<a class="kd-button" href="' + url + '"><span style="' + color + '">' + ('&#65509; ' + urlArr[key].p + (urlArr[key].v ? (' <span>|</span> ' + urlArr[key].v + ' (VIP)') : '')) + '</span></a>';
            }
            priceButton += '</div>';

            var oldInfoButton = '';
            if (isChanged) {
                oldInfoButton += '<a class="kd-button isChanged" href="' + url + '"></a>';
            }

            var delButton = '<div class="del" data="' + url + '"><img src="assets/images/delete.jpg" /></div>';

            var goButton = '<a class="kd-button kd-button-submit" href="' + url + '">GO</a>';

            var product = '<li class="product">' + divImg + divName + divFrom + priceButton + oldInfoButton + goButton + delButton + '</li>';

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

    $(function() {

        $('#products').append(getHtml());
        window.to = window.setTimeout(getHtml, 1000);
        chrome.extension.getBackgroundPage()._markJun_.stat(4);

        $('.isChanged').click(function() {
            var _markJun_ = chrome.extension.getBackgroundPage()._markJun_;
            _markJun_.clearChangedInfoByUrl(this.href);
            $(this).remove();
            return false;
        }).mouseover(function() {
            var _markJun_ = chrome.extension.getBackgroundPage()._markJun_;
            var info = _markJun_.getProductInfo(this.href);

            var oldStat = '<span>原 ';
            if (!info.op && !info.ov) {
                oldStat += info.o?_ONLINE_:_OFFLINE_;
            } else if (info.op && !info.ov) {
                oldStat += '&#65509; ' + info.op;
            } else if (!info.op && info.ov) {
                oldStat += '&#65509; ' + info.ov + ' (VIP)';
            } else {
                oldStat += '&#65509; ' + info.op + ' <span>|</span> ' + info.ov + ' (VIP)';
            }
            oldStat += '</span>';
            var a = $(this).parent().find('.buttoncontainer a');

            if (!a.attr('data')) a.attr('data', a.html())

            if (a.attr('sto')) clearTimeout(a.attr('sto'));

            a.find('span').animate({
                top:'15px'
            },300, function(){
                a.html(oldStat);
                a.find('span').animate({
                    top: '0px'
                }, 100)
            });
        }).mouseout(function() {
            var a = $(this).parent().find('.buttoncontainer a');
            a.attr('sto', setTimeout(function(){
                a.html(a.attr('data'));
            }, 300));
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
