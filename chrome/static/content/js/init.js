$.ajax({
    url: '//ps.lie360.com/static/plus/plus-config.json',
    type: 'get',
    cache: false,
    dataType:'json',
    success: function (data) {
        var LIE_PLUS_INIT_SCRIPT=[
            'http://ps.lie360.com/static/plus/link.js?t='+data.version,
            'http://ps.lie360.com/static/plus/main.js?t='+data.version
        ];
        var LIE_PLUS_INIT_STYLE=[
            'http://ps.lie360.com/static/plus/css/main.css?t='+data.version
        ];
        chrome.runtime.sendMessage({
            message: "getInitScript",
            scripts:LIE_PLUS_INIT_SCRIPT,
            styles:LIE_PLUS_INIT_STYLE
        });
    },
    error: function (data) {}
});
