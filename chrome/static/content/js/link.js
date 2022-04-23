/**
 * Created by hale_v on 18/1/16.
 */


var Link = function () {
  this.init();
};

Link.prototype = {
  init: function () {
    this.handle();
  },
  handle: function () {
    var _this = this;
    this.m = {
      "1": {
        domain: ".lagou.com",
        name: '拉勾'
      },
      "2": {
        domain: ".zhaopin.com",
        name: '智联'
      },
      "3": {
        domain: ".51job.com",
        name: '前程无忧'
      },
      "4": {
        domain: ".liepin.com",
        name: "猎聘"
      },
      "5": {
        domain: ".highpin.cn",
        name: "卓聘"
      },
      "6": {
        domain: ".fenjianli.com",
        name: "纷简历"
      }
    };
    this.windowObj = {}; //新开窗口的id;
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.message == 'sendCallback') {
        _this.sendCallback(request);
      } else if (request.message == "getAllCookies") {
        _this.getAllCookiesCb(request);
      } else if (request.message == 'madeReq') {
        _this.madeReqCb(request, sender);
      } else if (request.message == 'createWindow') {
        if (request.window) {
          _this.windowObj[request.cumId] = request.window.id;
        }
      } else if (request.message == 'removeShowCall') {
        var _d = {
          msg: 'showCall',
          cbId: request.cbId
        };
        _this.putCb(_d);
      }else if(request.message == 'getQueryTabsCb') {
          _this.loginNetUrlVerify(request);
      }
    });
    $(document.body).on('click', '.J_LieSendCookie', function () {
      _this.listener($(this));
    });
    $(document.body).on('click', '.J_LiePlusGetCookie', function () {
      try {
        var data = JSON.parse($(this).html());
      } catch (ex) {
        console.log(ex);
        return;
      }
      var from = data.from.split(',');
      $.each(from, function (i, item) {
        if (m[item]) {
          chrome.runtime.sendMessage({
            message: 'sendSearch',
            from: m[item],
            data: data.param,
            type: item
          });
        }
      })
    });

    /*$(document.body).on('click', '.J_LiePlusBridge', function () {
     _this.doBridge($(this));
     });*/
    window.addEventListener('message', function (event) {
      _this.doBridge(event);
    }, false);

    //发送当前窗口id回来,自动关闭用
    chrome.runtime.sendMessage({
      message: 'removeWindow'
    });
  },
  doBridge: function (event) {
    /*try {
     var data = JSON.parse(decodeURIComponent($this.html()));
     $(this).remove();
     } catch (ex) {
     console.log(ex);
     $(this).remove();
     return;
     }*/
    if (!event.data.isPagePost) {
      return false;
    }
    var data = event.data.data;
    var _this = this;
    if (data.msg == 'loginNet') {
      var t = data.type;
      _this.loginNet(t, _this.m[t].domain);
    } else if (data.msg == 'checkLoginNet') {
      _this.linkTypes = data.type.split(','); //需要连接的网站
      _this.logedList = [];
      _this.checkNetLoginFlg(); //校验是否已登陆相应外连网站
    } else if (data.msg == 'logoutNet') {
      var t = data.type;
      _this.logoutNet(t, _this.m[t].domain);
    } else if (data.msg == 'showCall') {
      _this.showCall(data);
    } else if (data.msg == 'openNewTab') {
      _this.openNewTab(data);
    } else {
      chrome.runtime.sendMessage({
        message: 'madeReq',
        pool: data.pool,
        msg: data.msg,
        type: data.type
      });
    }
  },
  sendCallback: function (request) {
    //回调的数据统一放到pool里
    var _d = {
      msg: request.msg,
      error: request.error,
      error_msg: request.error_msg,
      data: request.sucData
    };
    this.putCb(_d);
  },
  /**
   * 初始化页面时执行的交互
   */
  checkTask: function () {
    var _this = this;
    if ($('.J_LieSendCookie').length) {
      this.listener($('.J_LieSendCookie'));
    }
    $.each($('.J_PutPlusBridge'), function (i, item) {
      var event = {
        data: {
          data: JSON.parse($(item).text()),
          isPagePost: true
        }
      };
      _this.doBridge(event);
    })
  },
  listener: function ($this) {
    var _this = this;
    try {
      var data = JSON.parse($this.val());
    } catch (ex) {
      console.log(ex);
      return;
    }
    $this.remove();
    /*var data={
     from:"1,2",
     param:"af=asf&afs=12", //serialize的参数
     msg:'search',
     url:'http://www.lie360.com/my/searchResume'  //需求cookie的地址
     };*/
    var from = data.from.split(',');
    $.each(from, function (i, item) {
      if (_this.m[item].domain) {
        chrome.runtime.sendMessage({
          message: 'sendCookie',
          scData: {
            from: _this.m[item].domain,
            data: JSON.stringify(_this.getParam(data.param)),
            type: item,
            msg: data.msg, //请求的业务代号
            url: data.url
          }
        });
      }
    });
  },
  loginNet: function (type, domain) {
    var _this = this;
    var param = {};
    if (domain == this.m['2'].domain) {
      param = {
        url: "https://passport.zhaopin.com/org/login",
        title: '连接智联'
      }
    } else if (domain == this.m['4'].domain) {
      param = {
        url: "https://passport.liepin.com/h/account#sfrom=click-pc_homepage-front_navigation-hunter_new",
        title: '连接猎聘'
      }
    } else if (domain == this.m['5'].domain) {
      param = {
        url: "http://h.highpin.cn/Hunter",
        title: '连接卓聘'
      }
    } else if (domain == this.m['6'].domain) {
      param = {
        url: "http://fenjianli.com/login/home.htm",
        title: '连接纷简历'
      }
    }
    /*chrome.runtime.sendMessage({
     message:""
     })
     chrome.windows.create({
     url:param.url,
     tabId:1,
     type:'popup'
     });*/
    var iWidth = 1000; //弹出窗口的宽度;
    var iHeight = 800; //弹出窗口的高度;
    var iTop = (window.screen.availHeight - 30 - iHeight) / 2; //获得窗口的垂直位置;
    var iLeft = (window.screen.availWidth - 10 - iWidth) / 2; //获得窗口的水平位置;
    //this.openWindow = window.open(param.url,'_blank','width='+iWidth+',height='+iHeight+',top='+iTop+',left='+iLeft);
    chrome.runtime.sendMessage({
      message: 'createWindow',
      cumId: 'zllogin',
      createData: {
        url: param.url,
        left: iLeft,
        top: iTop,
        width: iWidth,
        height: iHeight,
        incognito: false
      }
    });

    /*var html = '<iframe marginheight="0" marginwidth="0" width="1020" height="600" frameborder="0" src="' + param.url + '"></iframe>';
     this.loginNetCheckDia = dialog.layer({
     width: 1000,
     height: 560
     }).setTitle(param.title).setContent(html).show();*/
    /*this.linkCount = 0;
     this.loginNetChecksit = setInterval(function () {
     _this.getAllCookies(type,domain);
     _this.linkCount++;
     if (_this.linkCount >= 600) { //600秒没有连接成功
     _this.cancelLink();
     dialog.alert('连接超时,请重试');
     }
     }, 1000);*/
  },
  /**
   *     取网站的cookie信息
   *     domain=>外网网站
   *     initFlg=>是否是初始化验证,会回调未登录提醒
   */
  getAllCookies: function (type, domain, initFlg) {
    chrome.runtime.sendMessage({
      message: 'getAllCookies',
      domain: domain,
      initFlg: initFlg,
      type: type
    });
  },
  checkNetLoginFlg: function () {
    var _this = this;
    for (var i = 0, len = this.linkTypes.length; i < len; i++) {
      (function (j) {
        var domain = _this.m[_this.linkTypes[j]].domain;
        _this.getAllCookies(_this.linkTypes[j], domain, '1');
      })(i);
    }
  },
  getAllCookiesCb: function (request) {
    var cookies = JSON.parse(request.cookies);
    var type = request.type;
    if (type == "2") {
      var loginFlg = false;
      if (cookies.Token && cookies.nTalk_CACHE_DATA) {
        loginFlg = true;
      } else {
        loginFlg = false;
        if (!cookies.Token) {
          chrome.runtime.sendMessage({
            message: 'deleteCookie'
          });
        }
      }
    } else if (request.domain == this.m['4'].domain) {
      var loginFlg = cookies.lt_auth;
      if(cookies.lt_auth){
        //取猎聘窗口，是否有验证页面
        chrome.runtime.sendMessage({
          message: 'getQueryTabs',
          url: "*://*.liepin.com/*",
          verify:'/secret/userintercept',
          type: type,
          initFlg:request.initFlg,
          loginFlg:loginFlg
        });
        return;
      }
    } else if (request.domain == this.m['5'].domain) {
      var loginFlg = cookies.htk;
    } else if (request.domain == this.m['6'].domain) {
      var loginFlg = cookies.JSESSIONID;
    }
    if (!loginFlg) {
      var _d = {
        msg: 'loginNet',
        type: type,
        status: 'fail'
      };
      if (request.initFlg) {
        this.putCb(_d);
      }
      return false;
    } else {
      this.cancelLink();
      var _d = {
        msg: 'loginNet',
        type: type,
        status: 'success',
        token: loginFlg,
        domain: request.domain
      };
      this.logedList.push(type);
      this.putCb(_d);
    }
  },
  /**
   * 判断外网登录的url验证
   */
  loginNetUrlVerify:function(request){
    if(request.data.status=="success"){
      this.cancelLink();
      var _d = {
        msg: 'loginNet',
        type: request.type,
        status: 'success',
        token: request.loginFlg,
        domain: request.domain
      };
      this.logedList.push(request.type);
      this.putCb(_d);
    }else{
      var _d = {
        msg: 'loginNet',
        type: request.type,
        status: 'fail'
      };
      if (request.initFlg) {
        this.putCb(_d);
      }
    }
  },
  /**
   * 把数据put回页面
   */
  putCb: function (_d) {
    /*var d = $('<div style="display: none" class="J_LiePlusCbBridge">' + encodeURIComponent(JSON.stringify(_d)) + '</div>');
     d.appendTo(document.body);
     d.click();*/
    _d.isExtPost = true;
    window.postMessage(_d, "*");
  },
  cancelLink: function (cb) {
    var _this = this;
    setTimeout(function () {
      _this.loginNetCheckDia && _this.loginNetCheckDia.remove();
      _this.openWindow && _this.openWindow.close();
      chrome.runtime.sendMessage({
        message: 'closeWindow',
        windowId: _this.windowObj['zllogin']
      });
      cb && cb();
    }, 1000);
    //this.loginNetChecksit && clearInterval(this.loginNetChecksit);
    //this.loginNetChecksit = null;
    //this.linkCount = 0;
  },
  //取外网数据回调
  madeReqCb: function (request) {
    if (request.error_msg) {
      dialog.tip(this.m[request.type].name + '解析失败,请稍后再试').show();
    } else if (request.sucData) {
      this.putCb(request);
    }
  },
  logoutNet: function (type, domain) {
    chrome.runtime.sendMessage({
      message: 'logoutNet',
      domain: domain,
      type: type
    });
  },
  //显式调起窗口
  showCall: function (data) {
    chrome.runtime.sendMessage({
      message: 'createWindow',
      cbId: data.cbId,
      autoRemove: data.autoRemove || false,
      createData: {
        url: data.url,
        incognito: false,
        top: 10,
        left: 10,
        width: 10,
        height: 10
      }
    });
  },
  openNewTab: function (data) {
    chrome.runtime.sendMessage({
      message: 'openNewTab',
      createData: {
        url: data.url
      }
    });
  }
};


var link = new Link();
$(document).ready(function () {
  link.checkTask();
});


/**
 * Created by hale_v on 18/1/16.
 */


var ListenCookie = function () {
  this.init();
};

ListenCookie.prototype = {
  init: function () {
    this.handle();
  },
  handle: function () {
    var _this = this;
    var href = window.location.host;
    if(href.indexOf('lie360.com')==-1){
      return false;
    }
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.message == 'cookieChange') {
        _this.cookieChange(request);
      }
    });
    this.loginzl = false;
    chrome.runtime.sendMessage({
      message: 'listenCookie'
    });
  },
  cookieChange: function (request) {
    var changeInfo = request.changeInfo;
    var cookie = changeInfo.cookie;
    var cause = changeInfo.cause;
    var removed = changeInfo.removed;
    var _this = this;
    var _d = {
      domain: cookie.domain,
      status: 'success'
    };

    if (cookie.domain == link.m["1"].domain) {

    } else if (cookie.domain == link.m["2"].domain) {
      // if (cookie.name == 'Token') {
      if (cookie.name == 'nTalk_CACHE_DATA') {
        if (removed === true || !cookie.value) {
          _d.msg = 'logoutNet';
          _d.type = '2';
          _this.loginzl = false;
          link.putCb(_d);
        } else if (cause == 'explicit' && cookie.value) {
          _d.msg = 'loginNet';
          _d.type = '2';
          link.cancelLink(function () {
            if (!_this.loginzl) {
              //同时多少变动,只走一次
              _this.loginzl = true;
              link.putCb(_d);
            }
          });
        }
      }
    } else if (cookie.domain == link.m['4'].domain || cookie.domain == 'h.liepin.com') {
      if (cookie.name == 'lt_auth') {
        // console.log(cookie);
        if (removed === true || !cookie.value) {
          _d.msg = 'logoutNet';
          _d.type = '4';
          // link.cancelLink()
          link.putCb(_d)
        }
        //else if (cause == 'explicit' && cookie.value) {
        //  link.getAllCookies('4', link.m['4'].domain, true);
        //_d.msg = 'loginNet';
        //_d.type = '4';
        //}
      }
      if (cookie.name == '__uv_seq') {
        link.getAllCookies('4', link.m['4'].domain, true);
      }
    } else if (cookie.domain == link.m['5'].domain) {
      if (cookie.name == 'htk') {
        if (removed === true || !cookie.value) {
          _d.msg = 'logoutNet';
          _d.type = '5';
          // link.cancelLink();
          link.putCb(_d);
        } else if (cause == 'explicit' && cookie.value) {
          link.getAllCookies('5', link.m['5'].domain, true);
          //_d.msg = 'loginNet';
          //_d.type = '5';
        }
      }
    } else if (cookie.domain == link.m['6'].domain) {
      if (cookie.name == 'JSESSIONID') {
        if (removed === true || !cookie.value) {
          _d.msg = 'logoutNet';
          _d.type = '6';
        } else if (cause == 'explicit' && cookie.value) {
          _d.msg = 'loginNet';
          _d.type = '6';
        }
        link.cancelLink();
        link.putCb(_d);
      }
    }
  }
};


var listenCookie = new ListenCookie();