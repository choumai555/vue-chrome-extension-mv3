/**
 * Created by hale_v on 16/11/29.
 */

var Background = function () {
  this.version = '3.6';
};
Background.prototype = {
  init: function () {
    this.handle();
    return this;
  },
  handle: function () {
    var _this = this;
    this.autoRemoveList = []; //自动关闭的窗口集
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      _this.onMessage(request, sender, sendResponse);
    });
    /*chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
      if (details.url.indexOf('zhaopin.com') != -1 && details.initiator && details.initiator.indexOf('lie360.com') != -1) {
        //var flg = false;
        for (var i = 0; i < details.requestHeaders.length; i++) {
          if (details.requestHeaders[i].name == 'Referer') {
            details.requestHeaders[i].value = 'https://www.zhaopin.com';
          }
          if (details.requestHeaders[i].name == 'Origin') {
            details.requestHeaders[i].value = 'https://www.zhaopin.com';
            //flg = true;
          }
        }
        /!*if(!flg){
          details.push({
            name: "Origin",
            value:"https://www.zhaopin.com"
          })
        }*!/
        return {
          requestHeaders: details.requestHeaders
        };
      }
    }, {
      urls: ["<all_urls>"]
    }, ["blocking", "requestHeaders"]);*/
  },
  onMessage: function (request, sender, callback) {
    switch (request.message) {
      case 'getInitScript':
          this.getInitScript(request,sender,callback);
            break;
      case 'getLoginInfo': //取登录信息
        this.getLoginInfo(request, sender, callback);
        break;
      case 'toLogin': //登录
        this.toLogin(request, sender, callback);
        break;
      case 'setUserInfo': //设置登录信息
        this.setUserInfo(request, sender, callback);
        break;
      case 'checkLogin': //检查是否登录
        this.getLoginInfo(request, sender, callback);
        break;
      case 'toExit': //退出登录
        this.toExit(request, sender, callback);
        break;
      case 'getResume': //保存简历
        this.getResume(request, sender, callback);
        break;
      case 'checkVer': //检查版本
        this.checkVer(request, sender, callback);
        break;
      case 'checkHadFlg': //检查版本
        this.checkHadFlg(request, sender, callback);
        break;
      case 'madeReq':
        this.madeReq(request, sender, callback);
        break;
      case 'sendCookie':
        this.sendCookie(request, sender, callback);
        break;
      case 'setIdent':
        this.setIdent(request, sender, callback);
        break;
      case 'getAllCookies':
        this.getAllCookie(request.domain, function (cookie,cookieObj) {
          request.cookies = cookie;
          request.cookieObj = cookieObj;
          chrome.tabs.sendMessage(sender.tab.id, request);
        });
        break;
      case 'logoutNet':
        this.logoutNet(request, sender, callback);
        break;
      case 'listenCookie':
        this.listenCookie(request, sender, callback);
        break;
      case 'createWindow':
        this.createWindow(request, sender, callback);
        break;
      case 'closeWindow':
        request.windowId && chrome.windows.remove(request.windowId);
        break;
      case 'removeWindow':
        //取窗口id,如是在autoRemoveList中,自动关闭
        this.checkAutoRemove();
        break;
      case 'deleteCookie':
        if (request && request.domain) {
          chrome.cookies.remove({
            url: request.domain,
            name: 'nTalk_CACHE_DATA'
          });
        }
        break;
      case 'openNewTab':
        this.openNewTab(request, sender, callback);
        break;
      case 'updateResume': // 更新简历
        this.updateResume(request, sender, callback);
            break;
      case 'putRequest':
            this.putRequest(request,sender,callback);
            break;
      case 'getQueryTabs':
            this.getQueryTabs(request,sender,callback);
            break;
    }
  },
  getInitScript:function(request, sender, callback){
    var scripts = request.scripts;
    var styles = request.styles;
    $.each(styles,function(i,item) {
      $.get(item, function(result) {
        chrome.scripting.insertCSS(sender.tab.id,  {code: result,runAt: "document_end"},function(){
          console.log("Load Success " + item);
        });
      }, "text");
    });
    $.each(scripts,function(i,item) {
      $.get(item, function(result) {
        chrome.scripting.executeScript(sender.tab.id, {code: result,runAt: "document_end"},function(){
          console.log("Load Success " + item);
        });
      }, "text");
    })
  },
  getLoginInfo: function (request, sender, callback) {
    var _this = this;
    /*chrome.storage.local.get('lieUserInfo',function(result){
     if(!result || $.isEmptyObject(result)){
     var res = '';
     }else{
     var res = result;
     }
     var req = $.extend(request,{'lieUserInfo':res});
     chrome.tabs.sendMessage(sender.tab.id, req);

     });*/
    chrome.cookies.getAll({
      url: 'http://ps.lie360.com/'
    }, function (cookies) {
      var res = {};
      for (var i = 0, len = cookies.length; i < len; i++) {
        if (cookies[i].name == 'name' || cookies[i].name == 'isLogin' || cookies[i].name == 'uid') {
          res[cookies[i].name] = cookies[i].value;
        }
      }
      res['userId'] = res['uid'];
      res['userName'] = res['name'];
      var req = $.extend(request, {
        'lieUserInfo': res
      });
      chrome.tabs.sendMessage(sender.tab.id, req);
    })
  },
  toLogin: function (requset, sender, callback) {
    $.ajax({
      url: 'http://ps.lie360.com/login',
      type: 'post',
      data: {
        email: requset.email,
        password: requset.password,
        checked: 'unchecked',
        version: this.version
      },
      success: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'toLoginCb',
          data: data
        });
      },
      fail: function (err) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'toLoginCb',
          data: {
            status: 'error'
          }
        });
      }
    });
  },
  setUserInfo: function (request, sender, callback) {
    var userName = request.userName;
    var userId = request.userId;
    chrome.storage.local.set({
      'lieUserInfo': {
        'userName': userName,
        'userId': userId
      }
    });
  },
  toExit: function (request, sender, callback) {
    /*chrome.storage.local.remove('lieUserInfo',function(){
     chrome.tabs.sendMessage(sender.tab.id, {message:'toExitCb'});
     });*/
    chrome.cookies.remove({
      url: 'http://ps.lie360.com',
      name: 'isLogin'
    });
  },
  getParam: function (url, name) {
    var reg = new RegExp(name + "=" + "(.[^&#]*)");
    return reg.exec(url);
  },
  getResume: function (request, sender, callback) {
    var _this = this;
    var phone = request.phone;
    var email = request.email;
    $.ajax({
      url: 'http://ps.lie360.com/my/resumeStrUpload',
      //url:'http://127.0.0.1:9020/my/resumeStrUpload',
      type: 'post',
      data: {
        file: request.file,
        userId: request.userId,
        uploadId: request.uploadId,
        fName: request.fName,
        phone: phone,
        email: email,
        version: this.version,
        fullHtml:request.fullHtml
      },
      success: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'getResumeCb',
          data: data
        });
      },
      fail: function (err) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'getResumeCb',
          data: {
            status: 'error'
          }
        });
      }
    })

  },
  checkVer: function (request, sender, callback) {
    $.ajax({
      url: 'http://ps.lie360.com/static/plus/plus-config.json?t=' + new Date().getTime(),
      type: 'get',
      cache: false,
      success: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'checkVerCb',
          data: data
        });
      },
      error: function (data) {}
    });
  },
  checkHadFlg: function (request, sender, callback) {
    $.ajax({
      url: 'http://ps.lie360.com/my/resumeSimilarity',
      data: {
        file: request.html,
        userId: request.userId,
        version: this.version
      },
      type: 'post',
      cache: false,
      dataType:'json',
      success: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'checkHadFlgCb',
          data: data
        });
      },
      error: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'checkHadFlgCb',
          data: {
            "isExist": false
          }
        });
      }
    });
  },
  madeReq: function (request, sender, callback) {
    var pool = request.pool;
    var output = pool.output;
    var _this = this;
    if (output.headers && !$.isEmptyObject(output.headers)) {
      chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
        if (details.url.indexOf(output.url) != -1) {
          $.each(output.headers, function (key, item) {
            var flg = true;
            for (var i = 0; i < details.requestHeaders.length; i++) {
              if (details.requestHeaders[i].name == i) {
                flg = false;
                details.requestHeaders[i].value = item;
              }
            }
            if (flg) {
              details.requestHeaders.push({
                name: key,
                value: item
              })
            }
          });
          return {
            requestHeaders: details.requestHeaders
          };
        }
      }, {
        urls: ["<all_urls>"]
      }, ["blocking", "requestHeaders"]);
    }

    var sendData = function (data) {
      var cb = pool.cb, //取到数据后回调服务器的参数
        oData = output.data, //去外网请求的参数
        cbData = cb.data;
      try {
        data = JSON.stringify(data);
      } catch (ex) {};
      try {
        oData = JSON.stringify(oData);
      } catch (ex) {};
      try {
        cbData = JSON.stringify(cbData);
      } catch (ex) {};
      //opData 从外网取回的数据,cbData 回调中传的data,opParam 去外网搜的参数
      //_this.getAllCookie(output.domain,function(cookies){
      $.ajax({
        url: cb.url,
        //data: $.extend({cbData:cbData}, {opData: data}, {opParam: oData},{cbCookie:cookies}),
        data: $.extend({
          cbData: cbData
        }, {
          opData: data
        }, {
          opParam: oData
        }),
        type: cb.method || 'get',
        dataTye: cb.dataTye || 'json',
        success: function (data) {
          if (data.status == 'success') {
            if (data.pool) {
              if (Object.prototype.toString.call(data.pool) == '[object Array]') {
                for (var i = 0, len = data.pool.length; i < len; i++) {
                  request.pool = data.pool[i];
                  _this.madeReq(request, sender, callback);
                }
              } else {
                request.pool = data.pool;
                _this.madeReq(request, sender, callback);
              }
            } else {
              request.sucData = data;
              _this.sendCallback(request, sender, callback);
            }
          } else {
            _this.sendCallback(request, sender, callback);
          }
        },
        error: function () {
          request.error = 'error';
          request.error_msg = '请求失败,请稍后再试';
          _this.sendCallback(request, sender, callback);
        }
      })
      //});
    };

    if (output.isImg) {
      var c = document.createElement("canvas");
      var ctx = c.getContext("2d");
      var img = new Image();
      img.onload = function () {
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var _data = c.toDataURL();
        sendData(_data);
      };
      img.onerror = function (err) {
        sendData('获取图片失败');
      };
      img.src = output.url;
    } else {
      var _param = {
        url: output.url,
        data: output.data,
        type: output.method || 'get',
        cache: false
      };
      if (output.isHtml) {
        _param["Content-Type"] = "text/html; charset=utf-8";
        _param.dataType = 'html';
        _param.xhrFields = {
          responseType: "text",
          withCredentials: true
        };
      } else {
        _param.dataType = output.dataType || 'json';
      }
      // console.log(_param)
      $.ajax(_param).done(function (data, status, aj) {
        if (aj.status == '202' && request.type == '2' && !request.autoReload) {
          request.autoRemove = true;
          request.autoReload = true;
          request.createData = {
            url: 'https://rdsearch.zhaopin.com/Home/ResultForCustom',
            incognito: false,
            top: -110,
            left: -110,
            width: 1,
            height: 1,
            type: 'panel'
          };
          _this.createWindow(request, sender);
          return false;
        }
        /*if (aj.status !== 200) {
          request.error_msg = "获取数据异常,请稍后再试";
          chrome.tabs.sendMessage(sender.tab.id, request);
          return false;
        }*/
        if (output.isHtml) {
          data = encodeURIComponent(data);
        }
        var cb = pool.cb; //取到数据后回调服务器的参数
        if (cb) {
          sendData(data);
        } else {
          request.sucData = data;
          request.ajaxStatus = aj.status;
          chrome.tabs.sendMessage(sender.tab.id, request);
          //_this.sendCallback(request,sender,callback);
        }
      }).fail(function (err) {
        request.error_msg = "获取数据异常,请稍后再试!";
        chrome.tabs.sendMessage(sender.tab.id, request);
        return false;
        /*var cb = pool.cb,oData = output.data;
         try{
         oData = JSON.stringify(output.data);
         }catch(ex){};
         $.ajax({
         url:cb.url,
         data: $.extend(cb.data,{cbError:err.status},{opParam:oData}),
         dataTye:cb.dataTye
         })*/
      }).always(function (a, b, c) {
        // console.log(a, b, c)
      })
    }

  },
  /**
   * 把对方请求的cookie带上传回
   * @param request
   * @param sender
   * @param callback
   */
  sendCookie: function (request, sender, callback) {
    var scData = request.scData;
    var _this = this;
    this.getAllCookie(scData.from, function (cookies) {
      var _p = $.extend({
        param: scData.data,
        cbCookie: cookies,
        type: scData.type
      }, JSON.parse(scData.data));
      $.ajax({
        //url: 'http://127.0.0.1:9020/my/searchResume',
        url: scData.url,
        data: _p,
        type: 'post',
        success: function (data) {
          if (data.status == 'success') {
            request.msg = scData.msg;
            if (data.pool) { //如果回调里有pool,将去外网访问
              if (Object.prototype.toString.call(data.pool) == '[object Array]') { //多个时,循环访问
                for (var i = 0, len = data.pool.length; i < len; i++) {
                  request.pool = data.pool[i];
                  _this.madeReq(request, sender, callback);
                }
              } else {
                request.pool = data.pool;
                _this.madeReq(request, sender, callback);
              }
            } else {
              request.sucData = data;
              _this.sendCallback(request, sender, callback);
            }
          } else {
            request.error = true;
            request.error_msg = data && data.error_msg || 'error';
            request.msg = scData.msg;
            _this.sendCallback(request, sender, callback);
          }
        },
        error: function (err) {
          request.error = true;
          request.error_msg = scData.url + 'is error';
          request.msg = scData.msg;
          _this.sendCallback(request, sender, callback);
        }
      })
    })
  },
  //取到自家数据后回调
  sendCallback: function (request, sender, callback) {
    request.message = 'sendCallback';
    chrome.tabs.sendMessage(sender.tab.id, request);
  },
  getAllCookie: function (domain, cb) {
    chrome.cookies.getAll({
      domain: domain
    }, function (cookies) {
      var cookieObj = {};
      for (var j = 0, jen = cookies.length; j < jen; j++) {
        cookieObj[cookies[j].name] = cookies[j].value;
      }
      var cookie = JSON.stringify(cookieObj);
      cb && cb(cookie,cookies);
    });
  },
  setIdent: function (request, sender, callback) {
    chrome.cookies.set({
      url: 'http://lie360.com',
      domain: '.lie360.com',
      name: 'liePlus',
      value: request.version
    });
  },
  logoutNet: function (request) {
    var type = request.type;
    var domain = 'https://' + request.domain;
    if (type == '2') {
      chrome.cookies.remove({
        url: domain,
        name: 'Token'
      });
      chrome.cookies.remove({
        url: domain,
        name: 'nTalk_CACHE_DATA'
      });
    } else if (type == '4') {
      chrome.cookies.remove({
        url: domain,
        name: 'lt_auth'
      });
      chrome.cookies.remove({
        url: 'https://h.liepin.com',
        name: 'WebIMToken'
      });
    } else if (type == '5') {
      chrome.cookies.remove({
        url: domain,
        name: 'htk'
      });
    } else if (type == '6') {
      chrome.cookies.remove({
        url: domain,
        name: 'JSESSIONID'
      });
    }
  },
  listenCookie: function (request, sender) {
    chrome.cookies.onChanged.addListener(function (changeInfo) {
      chrome.tabs.sendMessage(sender.tab.id, {
        message: 'cookieChange',
        changeInfo: changeInfo
      });
    });
  },
  createWindow: function (request, sender) {
    var _this = this;
    chrome.windows.create(request.createData, function (window) {
      if (request.autoRemove) {
        _this.autoRemoveList.push({
          windowsId: window.id,
          cbId: request.cbId,
          sender: sender,
          request: request
        });
      } else {
        request.window = window;
        chrome.tabs.sendMessage(sender.tab.id, request);
      }
    });
  },
  checkAutoRemove: function () {
    var _this = this;
    chrome.windows.getCurrent(function (window) {
      for (var i = 0, len = _this.autoRemoveList.length; i < len; i++) {
        if (_this.autoRemoveList[i]['windowsId'] == window.id) {
          chrome.windows.remove(window.id);
          chrome.tabs.sendMessage(_this.autoRemoveList[i].sender.tab.id, {
            message: 'removeShowCall',
            cbId: _this.autoRemoveList[i]['cbId']
          }, function (res) {
            _this.autoRemoveList.splice(i, 1);
          });
          if (_this.autoRemoveList[i].request.autoReload) {
            _this.madeReq(_this.autoRemoveList[i].request, _this.autoRemoveList[i].sender)
          }
          break;
        }
      }
    })
  },
  openNewTab: function (request, sender, callback) {
    chrome.tabs.create(request.createData);
  },
  updateResume:function(request, sender, callback){
    $.ajax({
      url: 'http://ps.lie360.com/my/resumeStrUpdate',
      data: {
        file: request.file,
        userId: request.userId,
        resumeId:request.resumeId,
        resumeFrom:request.resumeFrom||'0'
      },
      type: 'post',
      cache: false,
      success: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'updateResumeCb',
          data: data
        });
      },
      error: function (data) {
        chrome.tabs.sendMessage(sender.tab.id, {
          message: 'updateResumeCb',
          data: {
            "status": "fail"
          }
        });
      }
    });
  },
  putRequest:function(request,sender,callback){
    var _data = request.ajaxRequestData;
    _data.success = function(data){
      chrome.tabs.sendMessage(sender.tab.id, {
        message: request.message+'Cb',
        data: data,
        ajaxRequestData:request.ajaxRequestData
      });
    };
    _data.error = function(data){
      chrome.tabs.sendMessage(sender.tab.id, {
        message: request.message+'Cb',
        data: {
          "status": "ERROR_FAIL"
        },
        ajaxRequestData:request.ajaxRequestData
      });
    };
    $.ajax(_data);
  },
  getQueryTabs:function(request,sender,callback){
    chrome.tabs.query({url:request.url}, function(tabs){
        var flg = true;
        for(var i=0,len=tabs.length;i<len;i++){
          if(tabs[i].url.indexOf(request.verify)!=-1){
            flg = false;
            break;
          }
        }
        if(flg){
          chrome.tabs.sendMessage(sender.tab.id, {
            message: request.message+'Cb',
            data:{
              status:"success"
            },
            type: request.type,
            initFlg:request.initFlg
          });
        }else{
          chrome.tabs.sendMessage(sender.tab.id, {
            message: request.message+'Cb',
            data:{
              status:"fail"
            },
            type: request.type,
            initFlg:request.initFlg,
            loginFlg:request.loginFlg
          });
        }
    })
  }
};

var bg = new Background().init();