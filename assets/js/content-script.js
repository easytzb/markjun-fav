(function($) {
    var divStyle = " style='opacity: 1;zoom:1;position:fixed; bottom:103px; left:20px; z-index: 2147483647 !important;'";
    var divChildStyle = "style='display: inline-block;border: 1px solid #3079ED;text-align: center;color: white;font-size: 11px;font-weight: bold;height: 21px;padding: 0 8px;line-height: 21px;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 2px;-webkit-transition: all .218s;transition: all .218s;background-color: #4D90FE;background-image: -webkit-gradient(linear,left top,left bottom,from(#4D90FE),to(#4787ED));background-image: -webkit-linear-gradient(top,#4D90FE,#4787ED);background-image: linear-gradient(top,#4D90FE,#4787ED); cursor:pointer;-webkit-user-select: none;'";
    var delButtonStr = '<div id="_tgD_" ' + divStyle + '><div ' + divChildStyle + '>取消收藏</div></div>';
    var addButtonStr = '<div id="_tgA_" ' + divStyle + '><div ' + divChildStyle + '>收藏</div></div>';
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.ope) {
        case 'added':
            $('#_tgA_').remove();
            $('body').append(delButtonStr);
            break;
        case 'deleted':
        case 'new':
            $('#_tgD_').remove();
            $('body').append(addButtonStr);
            break;
        default:
            console.log('unkonw message');
            break
        }
    });
    chrome.extension.sendMessage({
        ope:
        'checkExist',
        u: location.href
    });
    $('#_tgD_').live('click', 
    function() {
        $('#_tgD_').remove();
        $('body').append(addButtonStr);
        chrome.extension.sendMessage({
            ope: 'delUrl',
            u: location.href
        });
        return false
    });
    $('#_tgA_').live('click', 
    function() {
        $('#_tgA_').remove();
        $('body').append(delButtonStr);
        chrome.extension.sendMessage({
            ope: 'addUrl',
            u: location.href
        });
        return false
    })
})(jQuery);