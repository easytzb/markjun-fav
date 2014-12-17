(function($) {
    window.sortedProductInfo = [];
    window._markJun_ = chrome.extension.getBackgroundPage()._markJun_;

    for (var key in localStorage) {
        if (key.indexOf('data_') !== 0) continue;
        window.sortedProductInfo.push(JSON.parse(localStorage[key]));
    };
    window.sortedProductInfo.sort(function(a, b) {
        return a.utime > b.utime ? -1 : 1
    });

    window.getHtml = function() {
        var htmlString = "",
            i = 0;
        window.is2nd = window.is2nd || 0;
        for (var key in window.sortedProductInfo) {
            if (++i < 7 && window.is2nd) continue;
            htmlString += _markJun_.productStr(window.sortedProductInfo[key]);
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
        _markJun_.stat(106);

        $('.imgcontainer').live('click', function() {
            _markJun_.stat(107);
            chrome.tabs.create({
                'url': $(this).parent().find('a').attr('href'),
                active: false
            })
        });
        $('.kd-button-submit').live('click', function() {
            _markJun_.stat(108);
            chrome.tabs.create({
                'url': $(this).attr('href'),
                active: false
            })
        });
        $('.refresh').live('click', function() {
            _markJun_.stat(113);
            $(this).parent().find('.locationname,.price-button').remove();
            var url = $(this).attr('data');
            var info = _markJun_.getProductInfo(url);
            info = _markJun_.newStatusStr(info);
            $(this).parent().find('.businessname').after(info);
            _markJun_.clearChangedInfoByUrl(url)
            $(this).removeClass('refresh').remove();
            return false;
        });

        $('.refresh img').mouseover(function() {
            $(this).parent().parent().find('.locationname,.price-button').remove();
            var url = $(this).parent().attr('data');
            var info = _markJun_.getProductInfo(url);
            info = _markJun_.newStatusStr(info);
            $(this).parent().parent().find('.businessname').after(info);
        }).mouseout(function() {
            $(this).parent().parent().find('.locationname,.price-button').remove();
            var url = $(this).parent().attr('data');
            var info = _markJun_.getProductInfo(url);
            info = _markJun_.oldStatusStr(info);
            $(this).parent().parent().find('.businessname').after(info);
        });
        $('.del').live('click', function() {
            _markJun_.stat(104);
            _markJun_.delUrl($(this).attr('data'));
            $(this).parents('.product').remove();
            return false
        })
    })
})(jQuery);
