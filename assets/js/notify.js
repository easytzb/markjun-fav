(function($) {
    var _DEFAULT_ = '<div class="hbox"><div class="hbox wide padded"><span class="subject" ><a class="first" href="http://item.taobao.com/item.htm?id=22537344629" title="拍前必读-老甘和他的朋友们的私货店">拍前必读-老甘和他的朋友们的私货店</a><br /><a class="last grey" href="http://item.taobao.com/item.htm?id=22537344629" title="拍前必读-老甘和他的朋友们的私货店">2012.00->2013.00</a><span class="delButton"><img src="assets/images/delete.jpg" /></span></span></div></div>' + '<div class="hbox"><div class="hbox wide padded"><span class="subject" ><a class="first" href="http://item.taobao.com/item.htm?id=18880139288" title="唱曲亲来听-老甘和他的朋友们的私货店">唱曲亲来听-老甘和他的朋友们的私货店</a><br /><a class="last green" href="http://item.taobao.com/item.htm?id=18880139288" title="唱曲亲来听-老甘和他的朋友们的私货店">刚刚上架</a><span class="delButton"><img src="assets/images/delete.jpg" /></span></span></div></div>' + '<div class="hbox"><div class="hbox wide padded"><span class="subject" ><a class="first" href="http://item.taobao.com/item.htm?id=17196210800" title="欢唱又一波-老甘和他的朋友们的私货店">欢唱又一波-老甘和他的朋友们的私货店</a><br /><a class="last green" href="http://item.taobao.com/item.htm?id=17196210800" title="欢唱又一波-老甘和他的朋友们的私货店">刚刚上架</a><span class="delButton"><img src="assets/images/delete.jpg" alt="知道了" title="知道了" /></span></span></div></div>';
    var _IS_DEFAULT_ = chrome.extension.getBackgroundPage()._IS_DEFAULT_;
    chrome.extension.getBackgroundPage()._IS_DEFAULT_ = false;
    $(function() {
        $('#delButton').click(function() {
            $('#showButton').show();
            $(".actions").animate({
                left: (19 - $('.actions').width())
            },
            400);
            return false
        });
        $('#showButton').click(function() {
            $(".actions").animate({
                left: "0px"
            },
            400, 
            function() {
                $('#showButton').hide()
            });
            return false
        });
        $('body').scroll(function() {
            if (!window._stFlat && $(".actions").css('left') != ((19 - $('.actions').width()) + 'px')) {
                window._stFlat = setTimeout(function() {
                    $('#showButton').show();
                    $(".actions").animate({
                        left: (19 - $('.actions').width())
                    },
                    400, 
                    function() {
                        window._stFlat = null
                    })
                },
                1)
            }
            return false
        });
        $('.actions').css('left', 19 - $('.actions').width()).show();
        if (_IS_DEFAULT_) {
            html = _DEFAULT_
        } else {
            var data = chrome.extension.getBackgroundPage()._markJun_.getChangedProduct();
            var html = '';
            for (var k in data) {
                html += '<div class="hbox"><div class="hbox wide padded"><span class="subject" >';
                html += '<a class="first" href="' + data[k].u + '" title="' + data[k].t + '">' + data[k].t + '</a><br /><a class="last" style="' + data[k].color + '" href="' + data[k].u + '" title="' + data[k].t + '">';
                html += data[k].changeStr + '</a><span class="delButton"><img src="assets/images/delete.jpg" alt="知道了" title="知道了" /></span></span></span></div></div>'
            }
        }
        if (html) $('#_content').append(html);
        else $('.unread').html('暂时没有未处理的状态变化');
        if (!_IS_DEFAULT_) chrome.extension.getBackgroundPage()._markJun_.stat('c1', data.length);
        data = null;
        $('.delButton').click(function() {
            var url = $(this).parent().find('a').attr('href');
            if (!_IS_DEFAULT_) {
                chrome.extension.getBackgroundPage()._markJun_.stat(6);
                chrome.extension.getBackgroundPage()._markJun_.editUrl(url, {
                    op: null,
                    ptime: null,
                    otime: null,
                    vtime: null,
                    ov: null
                })
            }
            $(this).parent().parent().parent().remove();
            if ($('#_content .first').size() == 0) chrome.extension.getBackgroundPage()._markJun_.clearNotify();
            return false
        });
        $('.padded a').click(function() {
            if (!_IS_DEFAULT_) chrome.extension.getBackgroundPage()._markJun_.stat(7);
            chrome.extension.getBackgroundPage()._markJun_.openProduct(this.href);
            return false
        });
		$('#nav').mouseover(function(){
			$(this).hide(2000);	
		})
    })
})(jQuery);