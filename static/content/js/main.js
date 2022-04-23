var Main = function () {
    this.version = "3.6";
};
Main.prototype = {
    init: function () {
        debugger
        console.log(`??????`)
        this.base = new BaseUtil();
        this.checkDomain();
        this.handle();
        return this;
    },
    handle: function () {
        var _this = this;
        this.ident();
        chrome.runtime.onMessage.addListener(function (request,sender,sendResponse) {
            if (request.message == "getLoginInfo") {
                _this.setLoginInfo(request["lieUserInfo"]);
            } else if (request.message == "toLoginCb") {
                _this.loginCb(request);
            } else if (request.message == "checkLogin") {
                _this.checkLoginCb(request);
            } else if (request.message == "toExitCb") {
                _this.exitCb(request);
            } else if (request.message == "getResumeCb") {
                _this.getResumeCb(request); //弃用,用putRequestCb中的回调
            } else if (request.message == "checkVerCb") {
                _this.checkVerCb(request);
            } else if (request.message == "checkHadFlgCb") {
                _this.checkHadFlgCb(request); //弃用,用putRequestCb中的回调
            } else if (request.message == "updateResumeCb") {
                _this.updateResumeCb(request); //弃用,用putRequestCb中的回调
            }else if(request.message == 'putRequestCb'){
                if(request.ajaxRequestData.markId=='getResumeCb'){
                    _this.getResumeCb(request);
                }else if(request.ajaxRequestData.markId=='updateResumeCb'){
                    _this.updateResumeCb(request);
                }else if(request.ajaxRequestData.markId=='checkHadFlgCb'){
                    _this.checkHadFlgCb(request);
                }
            }
        });
        /*chrome.runtime.sendMessage({
         message: "putRequest",
         ajaxRequestData: {
         url:'https://example.com',
         type:'get',
         markId:'1234'
         }
         });*/
    },
    getParam: function (str) {
        if (str.indexOf("?") == -1) {
            str = str.slice(str.indexOf("?") + 1);
        }
        var obj = {},
            strArr = str.split("&");
        for (var i = 0; i < strArr.length; i++) {
            var arr = strArr[i].split("=");
            obj[arr[0]] = arr[1];
        }
        return obj;
    },
    ident: function () {
        var _this = this;
        chrome.runtime.sendMessage({
            message: "setIdent",
            version: _this.version
        });
    },
    setLoginInfo: function (data) {
        var _this = this;
        _this.lieUserInfo = data;
        //console.log(_this.lieUserInfo);
        //this.checkHadFlg();
        if (data && data.isLogin === "true") {
            _this.$a.find("#J_ToLogin").hide();
            _this.$a.find("#J_ToExit").show();
            _this.$a
                .find(".lie-plus-t span")
                .text(decodeURIComponent(data.userName))
                .data("id", data.userId);
        }
    },
    getLoginInfo: function () {
        chrome.runtime.sendMessage({
            message: "getLoginInfo"
        });
    },
    checkDomain: function () {
        var _this = this;
        var host = window.location.host;
        var domain = [
            "liepin",
            "zhaopin",
            "highpin",
            "fenjianli",
            "jianlika",
            "lagou",
            "linkedin",
            "dajie",
            "xmrc",
            "maimai",
            "51job"
        ];
        for (var i = 0, len = domain.length; i < len; i++) {
            if (host.indexOf(domain[i]) != -1) {
                _this.checkVer();
                _this.createBtn();
                this.getLoginInfo();
                return false;
            }
        }
    },
    checkVer: function () {
        chrome.runtime.sendMessage({
            message: "checkVer"
        });
    },
    checkVerCb: function (request) {
        var ver = request.data.version;
        if (ver == this.version) { //main.js中版本与config.json中版本号比较,是否提示更新
            this.$a.find(".lie-plus-b b").show();
        } else {
            this.$a.find(".lie-plus-b a").show();
        }
    },
    createBtn: function () {
        var _this = this;
        _this.$a = $(
            '<div class="lie-plus-wrap">' +
            '<div class="lie-plus-t clearFix1"><a href="javascript:;" id="J_ToLogin">登录</a><a style="display: none;" href="javascript:;" id="J_ToExit" title="退出"><i class="iconfont">&#xe6f1;</i></a><span>未登录</span></div>' +
            '<div class="lie-plus-btns">' +
            '<p><a id="J_CheckToFlg" href="javascript:;">检测已存在否</a></p>' +
            '<p><a id="J_GatherToLie" href="javascript:;">收集到全猎网</a></p>' +
            '<p><a href="http://ps.lie360.com" target="_blank">进入全猎网</a></p>' +
            "</div> " +
            '<div class="lie-plus-b clearFix1"><a style="display: none" href="http://ps.lie360.com/downloadPlus/plus" target="_blank">点击更新</a><span>Ver:' +
            _this.version +
            '<b style="display:none">已最新</b></span></div>' +
            "</div>"
        );
        _this.$a.appendTo(document.body);
        _this.$a.find("#J_GatherToLie").on("click", function () {
            _this.getResume();
        });
        _this.$a.find("#J_ToLogin").on("click", function () {
            _this.toLogin();
        });
        _this.$a.find("#J_ToExit").on("click", function () {
            _this.toExit();
        });
        _this.$a.find("#J_CheckToFlg").on("click", function () {
            _this.checkHadFlg();
        });
        /*$("#J_Pub").click(function() {
         _this.publishPost('LP');
         });*/
        var down = false,
            m,
            y,
            n;
        _this.$a.find(".lie-plus-t").on("mousedown", function (e) {
            e.preventDefault();
            down = true;
            //m = e.pageY-_this.$a.offset().top;
        });
        $(document.body)
            .on("mousemove", function (e) {
                if (!down) {
                    return;
                }
                e.preventDefault();
                y = e.clientY;
                _this.$a.css("top", y);
            })
            .on("mouseup", function (e) {
                if (!down) {
                    return;
                }
                down = false;
            });
    },
    getResume: function () {
        $("#J_PlugCheckFlg").hide();
        chrome.runtime.sendMessage({
            message: "checkLogin",
            type: "getResume"
        });
    },
    checkLoginCb: function (request) {
        if (request.lieUserInfo && request.lieUserInfo.isLogin === "true") {
            this.isLogin = true;
            if (request.type == "getResume") {
                this.toGetResume();
            }
        } else {
            this.toLogin();
        }
    },
    toLogin: function () {
        this.exitCb();
        var _html =
            '<div class="lie-plus-login">' +
            "<ul>" +
            '<li><span>全猎网用户名:</span><input type="text" name="email" value="" id="J_PlusEmail" class="global-input-text"/></li>' +
            '<li><span>全猎网密码:</span><input type="password" name="password" id="J_PlusPass" autocomplete="new-password" value="" class="global-input-text"/></li>' +
            '<li><a href="javascript:;" class="global-btn" id="J_PlusLieLogin">登录</a></li>' +
            "</ul>" +
            "</div>";
        this.loginDia = dialog
            .layer()
            .setTitle("登录到全猎网")
            .setContent(_html)
            .show();
        $("#J_PlusLieLogin").on("click", function () {
            if ($(this).data("isLogining")) {
                return false;
            }
            $(this)
                .text("登录中")
                .data("isLogining", true);
            var email = $.trim($("#J_PlusEmail").val());
            var pass = $("#J_PlusPass").val();
            if (!email || !pass) {
                dialog.alert("用户名和密码不能为空");
                return false;
            }
            chrome.runtime.sendMessage({
                message: "toLogin",
                email: email,
                password: pass
            });
        });
    },
    loginCb: function (request) {
        var data = request.data;
        $("#J_PlusLieLogin")
            .text("登录")
            .data("isLogining", false);
        if (data.status == "success") {
            this.loginDia.remove();
            this.loginDia = null;
            data.isLogin = "true";
            this.setLoginInfo(data);
            /*chrome.runtime.sendMessage({
             message : "setUserInfo",
             userName:data.userName,
             userId:data.userId
             });*/
            //this.checkHadFlg();
        } else {
            dialog.alert(data.error_msg || "网络故障,请稍后再试");
        }
    },
    toExit: function () {
        chrome.runtime.sendMessage({
            message: "toExit"
        });
        this.exitCb();
    },
    exitCb: function () {
        var _this = this;
        _this.$a.find("#J_ToLogin").show();
        _this.$a.find("#J_ToExit").hide();
        _this.$a
            .find(".lie-plus-t span")
            .text("未登录")
            .data("id", "");
        _this.lieUserInfo = null;
    },
    getMd5: function (costom) {
        return hex_md5("lie" + new Date().getTime() + Math.random() + costom);
    },
    toGetResume: function () {
        var _this = this;
        var host = window.location.href;
        var netUrl= host;
        var netResumeFrom = '';
        var netResumeId = '';
        var $btn = _this.$a.find("#J_GatherToLie");
        if ($btn.data("ing")) {
            return false;
        }

        //发送信息到后台
        var getData = function (html,fName,fullHtml,phone,email) {
            if(_this.isUping){
                return;
            }
            _this.isUping=true;
            chrome.runtime.sendMessage({
                message: "putRequest",
                ajaxRequestData: {
                    url: 'http://ps.lie360.com/my/resumeStrUpload',
                    type: 'post',
                    data: {
                        file: html,
                        userId: _this.lieUserInfo.userId,
                        uploadId: _this.getMd5(_this.lieUserInfo.userId),
                        fName: fName,
                        phone: phone,
                        email: email,
                        version: _this.version,
                        fullHtml:fullHtml,
                        netUrl:netUrl,
                        netResumeFrom:netResumeFrom,
                        netResumeId:netResumeId
                    },
                    markId:'getResumeCb'
                }
            });
            /*chrome.runtime.sendMessage({
                message: "getResume",
                file: html,
                userId: _this.lieUserInfo.userId,
                uploadId: _this.getMd5(_this.lieUserInfo.userId),
                fName: name,
                phone: pData,
                email: eData,
                fullHtml:fullHtml,
                netUrl:host,
                netResumeFrom:"猎聘",
                netResumeId:_id
            });*/
        };

        _this.$a
            .find("#J_GatherToLie")
            .text("收集中")
            .data("ing", true);
        if (host.indexOf("h.liepin.com/resume/showresumedetail") != -1||host.indexOf("h.liepin.com/localresume/showlocalresumedetail") != -1) {
            var $html = $(".content").clone();
            $html.find('.resume-work-info').remove();
            $html.find('.resume-job-title').find('.float-right').remove();
            $html.find('.resume-basic').find('.alert-warning').remove();
            var html = $html.html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "lp_" +
                $('[data-nick="res_id"]').text() +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            netResumeId = $('html').find('.resume-sub-info span').text();
            netResumeFrom = '猎聘';
            var domain = "https://h.liepin.com";
            var phone = $(".resume-basic-info .telphone").length ?
            domain + $(".resume-basic-info .telphone").attr("src") :($('.show-img').length?domain+$('.show-img').eq(0).attr('src'):'');
            var email = $(".resume-basic-info .email").length ?
            domain + $(".resume-basic-info .email").attr("src") :($('.show-img').length?domain+$('.show-img').eq(1).attr('src'):'');
            var pData = "",eData = "";
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            fullHtmlDom.find('script').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML').replace(/'\/\//ig,'\'http://').replace(/"\/\//ig,'\"http://');
            /*var getData = function () {
                chrome.runtime.sendMessage({
                    message: "getResume",
                    file: html,
                    userId: _this.lieUserInfo.userId,
                    uploadId: _this.getMd5(_this.lieUserInfo.userId),
                    fName: name,
                    phone: pData,
                    email: eData,
                    fullHtml:fullHtml,
                    netUrl:host,
                    netResumeFrom:"猎聘",
                    netResumeId:netResumeId
                });
            };*/
            var getImgData = function (type, url) {
                var c = document.createElement("canvas");
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function () {
                    c.width = img.width;
                    c.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    if (type == "phone") {
                        pData = c.toDataURL();
                        getImgData("email", email);
                    } else {
                        eData = c.toDataURL();
                        getData(html,name,fullHtml,pData,eData);
                    }
                };
                img.onerror = function (err) {
                    if (type == "phone") {
                        getImgData("email", email);
                    } else {
                        getData(html,name,fullHtml,pData,eData);
                    }
                };
                img.src = url;
            };
            if (phone) {
                getImgData("phone", phone);
            } else if (email) {
                getImgData("email", email);
            } else {
                getData(html,name,fullHtml,pData,eData);
            }
        }else if(host.indexOf("lpt.liepin.com/cvview/showresumedetail") != -1){
            $html = $(document.body).clone();
            $html.find('#header-lpt,.title-info,.tabs-switch,.btns.clearfix,#person-test,.fun-list,.lie-plus-wrap').remove();
            var html = $html.html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
              "lp_" +
              $(".title-info .float-left small").eq(1)
                .text() +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = $(".title-info .float-left small").eq(1).text();
            netResumeFrom = '猎聘HR版';
            getData(html,name,fullHtml);
        } else if (
            host.indexOf("highpin.cn/ResumeManage") != -1 ||
            host.indexOf("highpin.cn/SearchResume") != -1
        ) {
            var html = $(document.body).html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "zp_" +
                $(".resume-num")
                    .text()
                    .slice(5) +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netUrl = 'https://h.highpin.cn/SearchResume/SearchResumeInfo?seekerUserID='+$('#SeekerUserID').val()+'&resumeID='+$('#ResumeID').val();
            netResumeId = $('#SeekerUserID').val()+'+'+$('#ResumeID').val();
            netResumeFrom = '卓聘';
            getData(html,name,fullHtml);
            /*chrome.runtime.sendMessage({
                message: "getResume",
                file: html,
                userId: _this.lieUserInfo.userId,
                uploadId: _this.getMd5(_this.lieUserInfo.userId),
                fName: name,
                phone: "",
                email: "",
                fullHtml:fullHtml
            });*/
        } else if (
            host.indexOf("fenjianli.com") != -1 &&
            host.indexOf("detail") != -1
        ) {
            var html = $("iframe#tabNav").contents().find('body').html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "fjl_" +
                $("#resume-name-id span")
                    .text()
                    .slice(3) +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = $("iframe#tabNav").contents().find('body').find('input[name="resume_id"]').val();
            netResumeFrom = '纷简历';
            getData(html,name,fullHtml);
        } else if (host.indexOf("zhaopin.com") != -1) {
            var $html = $(document.body).clone();
            $html.find('.resume-setting__trigger-label,.resume-setting__panel').remove();
            if(host.indexOf('/resume/manage/')!=-1){
                var html = $html.find('.dave-resDetail-cont').html();
            }else{
                $html.find('.lie-plus-wrap,.plus-resume-list').remove();
                var html = $html.html();
            }
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "zl_" +
                $(".resume-content__header span span.resume-content--letter-spacing")
                    .text()
                    .slice(3) +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            fullHtmlDom.find('script').each(function(i,item){
                var _src = $(item).attr('src');
                if(_src && _src.indexOf('js/router.js')!=-1){
                    item.remove();
                }
                if(_src && _src.indexOf('http')==-1){
                    $(item).attr('src','https:'+ _src);
                }
            })
            fullHtmlDom.find('link').each(function(i,item){
                var _href = $(item).attr('href');
                if(_href && _href.indexOf('http')==-1){
                    $(item).attr('href','https:'+ _href);
                }
            })
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = $(".resume-content__header span span.resume-content--letter-spacing").text().slice(3);
            netResumeFrom = '智联';
            getData(html,name,fullHtml);
        } else if (host.indexOf("jianlika.com/Resume") != -1) {
            var html = $("div.content").html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "jlk_" +
                $(".meta li:first")
                    .text()
                    .slice(5) +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = $(".meta li:first")
                .text()
                .slice(5);
            netResumeFrom = '简历咖';
            getData(html,name,fullHtml);
        } else if (host.indexOf("easy.lagou.com") != -1) {
            var html =
                $(".detail-content").html() ||
                $(".mr_myresume_l").html() ||
                $("body").html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "lg_" +
                $(".add-chat-list").attr("data-resumeidout") +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = $(".add-chat-list").attr("data-resumeidout");
            netResumeFrom = '拉勾';
            getData(html,name,fullHtml);
        } else if (host.indexOf("linkedin.com") != -1) {
            var $html = $('.body').clone();
            $html.find('.pv-treasury-carousel').remove();
            $html.find('.pv-entity__bullet-item').remove();
            $html.find("#experience-section").find('.pv-profile-section__card-item.pv-position-entity.ember-view').find('.pv-entity__summary-info').each(function(i,item){
                $(item).find('h3').appendTo($(item).find('h4:first'));
            });
            var html =
                "姓名:" +
                $("artdeco-modal-header").text() +
                $("artdeco-modal-content").text()+
                $html.find("#experience-section")
                    .text()
                    .replace(/任职时长/g, "").replace(/[\n\r]/gi,'') +'\n'+
                $html.find("#education-section").text().replace(/[\n\r]/gi,'');
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "linked_" +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            var rut = host.match(/.+in\/(.[^\/]+)\/?/);
            try{
                netResumeId = rut[1];
            }catch(ex){
            }
            netResumeFrom = '领英';
            getData(html,name,fullHtml);
        } else if (host.indexOf("dajie.com") != -1) {
            var html = $("#apply-resume-in")
                .contents()
                .find(".profile-in")
                .html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var name =
                "dj_" +
                $("#apply-resume-in")
                    .contents()
                    .find("#encryptedId").val() +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = $("#apply-resume-in")
                .contents()
                .find('#resumeId').val();
            netResumeFrom = '大街';
            getData(html,name,fullHtml);
        } else if (host.indexOf("xmrc.com.cn") != -1) {
            var html = $("#content").html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var _id = this.base.getParam(window.location.href.slice(window.location.href.indexOf("?")+1))["TalentID"] || this.base.getParam(window.location.href.slice(window.location.href.indexOf("?")+1))["ID"];
            var name =
                "xmrc_" +
                _id +
                "_" +
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = _id;
            netResumeFrom = '厦门人才网';
            getData(html,name,fullHtml);
        } else if (host.indexOf("maimai.cn/contact/detail") != -1) {
            var $html = $(".PCcontent").clone();
            $html.find('.contact_detail_name span').text($html.find('.contact_detail_name span').text()+' ');
            $html.find('.icon_mai_number_gray').text('英文名:'+$html.find('.icon_mai_number_gray').text());
            $html.find('.icon_phone_gray').text('联系电话:'+$html.find('.icon_phone_gray').text());
            $html.find('.icon_email_gray').text('email:'+$html.find('.icon_email_gray').text());
            $html.find('.font-12.o-hidden.m-t-2.text-muted').text('行业:'+$html.find('.font-12.o-hidden.m-t-2.text-muted').text());
            $html.find('.panel-default').each(function(){
                if($(this).text().indexOf('我要点评')!=-1||$(this).text().indexOf('好友印象')!=-1||$(this).text().indexOf('的人还看了')!=-1||$(this).text().indexOf('职业标签')!=-1||$(this).text().indexOf('还没有人点评过胡均')!=-1){
                    $(this).remove();
                }
                if($(this).text().indexOf('工作经历')!=-1){
                    $(this).find('.list-group-item-heading .title').each(function(){
                        var txt = $(this).text();
                        var $t = $(this).next('.list-group-item-text').find('.text-muted');
                        $t.text($t.text().replace('，','，公司名称:'+txt+'，职位:'));
                        $t.text($t.text()+' ');
                        $(this).text('');
                        var $work = $(this).closest('.list-group-item-heading').nextAll('.short-text');
                        $work.text('工作职责:'+$work.text());
                    })
                }
            });
            $html.find('.friend_tips').remove();
            var html = $html.html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var rut = host.match(/.+detail\/(.[^\/\?#]+)\/?/);
            try{
                var _id = rut[1];
            }catch (ex){
                var _id= '';
            }
            var name =
                "maimai_" +_id+
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = _id;
            netResumeFrom = '脉脉';
            getData(html,name,fullHtml);
        } else if (host.indexOf("maimai.cn/resume") != -1) {
            var $html = $(".resumeLeft").clone();
            $html.find('.resInfo.workInfo li').each(function(){
                $(this).find('em:first').prependTo($(this));
            });
            var html = $html.html();
            if (!html) {
                this.showSuport();
                return false;
            }
            var rut = host.match(/.+detail\/(.[^\/\?#]+)\/?/);
            try{
                var _id = rut[1];
            }catch (ex){
                var _id= '';
            }
            var name =
                "maimai_" +_id+
                new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = _id;
            netResumeFrom = '脉脉';
            getData(html,name,fullHtml);
        }else if (host.indexOf("51job.com") != -1 && host.indexOf("ResumeView") != -1) {
            var $html = $(document.body).clone();
            $html.find('#spase,#wyntgg,#MenuContent,#divRecom').remove();
            var html = $html.html();
            if (!html) {
                this.showSuport();
                return false;
            }
            //var _id = this.base.getParam(window.location.href)["TalentID"];
            var _id =$.trim($('.box1 span:first').text().replace('ID:',''));
            var name =
                "51job_" + _id+new Date().getTime() +
                Math.floor(Math.random() * 10000);
            var fullHtmlDom = $('html').clone();
            fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
            var fullHtml = fullHtmlDom.prop('outerHTML');
            netResumeId = _id;
            netResumeFrom = '51job';
            getData(html,name,fullHtml);
        } else {
            this.showSuport();
            return false;
        }
    },
    showSuport: function () {
        this.$a
            .find("#J_GatherToLie")
            .text("收集到全猎网")
            .data("ing", false);
        dialog.alert(
            '没有检查到简历信息<br/>请升级插件到最新版本或<a target="_blank" href="http://ps.lie360.com/aboutUs?J_feedback&">问题反馈</a>'
        );
    },
    getResumeCb: function (request) {
        var _this = this;
        _this.$a
            .find("#J_GatherToLie")
            .text("收集到全猎网")
            .data("ing", false);
        _this.isUping = false;
        if (!request.data || request.data.status !== "success") {
            dialog.alert(
                request.data.error_msg ||
                '收集出错,请稍后再试,<a target="_blank" href="http://ps.lie360.com/aboutUs?J_feedback&">点击反馈</a>'
            );
        } else {
            var res = request.data;
            var status = {
                "0": {
                    class: "error",
                    type: "上传失败",
                    tip: "关键信息不完整",
                    pro: '<a href="http://ps.lie360.com/my/resumeToAdd?resumeId=' +
                    res.resumeId +
                    '" target="_blank">快速编辑</a>'
                },
                "1": {
                    class: "error",
                    type: "上传失败",
                    tip: "内容不可识别",
                    pro: '<a href="http://ps.lie360.com/my/resumeToAdd" target="_blank">手动添加</a>'
                },
                "2": {
                    class: "error",
                    type: "上传失败",
                    tip: "网络故障",
                    pro: '<a href="http://ps.lie360.com/my/resumeToAdd" target="_blank">手动添加</a>'
                },
                "3": {
                    class: "suc",
                    type: "上传成功",
                    tip: "&nbsp;",
                    pro: '<a href="http://ps.lie360.com/my/viewResume?resumeId=' +
                    res.resumeId +
                    '" target="_blank">查看</a><b class="cc">|</b><a href="http://ps.lie360.com/my/viewResume?resumeId=' +
                    res.resumeId +
                    '" target="_blank">快速编辑</a>'
                },
                "4": {
                    class: "warn",
                    type: "上传成功",
                    tip: "公司库已存在该简历,已更新",
                    pro: '<a href="http://ps.lie360.com/my/viewResume?resumeId=' +
                    res.resumeId +
                    '" target="_blank">查看</a><b class="cc">|</b><a href="http://ps.lie360.com/my/viewResume?resumeId=' +
                    res.resumeId +
                    '" target="_blank">快速编辑</a>'
                },
                "5": {
                    class: "error",
                    type: "上传失败",
                    tip: "文件过大",
                    pro: '<a href="http://ps.lie360.com/my/resumeToAdd" target="_blank">手动添加</a>'
                },
                "6": {
                    class: "error",
                    type: "上传失败",
                    tip: "文件类型不支持",
                    pro: '<a href="http://ps.lie360.com/my/resumeToAdd" target="_blank">手动添加</a>'
                },
                "7": {
                    class: "warn",
                    type: "上传成功",
                    tip: "个人库之前已存在该简历,已更新",
                    pro: '<a href="http://ps.lie360.com/my/viewResume?resumeId=' +
                    res.resumeId +
                    '" target="_blank">查看</a><b class="cc">|</b><a href="http://ps.lie360.com/my/viewResume?resumeId=' +
                    res.resumeId +
                    '" target="_blank">快速编辑</a>'
                }
            };
            dialog.alert(
                status[res.fileStatus].type +
                "," +
                status[res.fileStatus].tip +
                "," +
                status[res.fileStatus].pro
            );
        }
    },
    checkHadFlg: function () {
        var _this = this;
        var host = window.location.href;
        var netUrl = host;
        var netResumeFrom = '';
        var netResumeId = '';
        var fName = '';
        if (!_this.lieUserInfo || $.isEmptyObject(_this.lieUserInfo)) {
            _this.toLogin();
            return false;
        }
        if (host.indexOf("h.liepin.com/resume/showresumedetail") != -1) {
            var $html = $(".content").clone();
            $html.find('.resume-work-info').remove();
            $html.find('.resume-job-title').find('.float-right').remove();
            $html.find('.resume-basic').find('.alert-warning').remove();
            netResumeFrom='猎聘';
            var html = $html.html();
            netResumeId = $('html').find('.resume-sub-info span').text();
            fName =
              "lp_" +
              $('[data-nick="res_id"]').text() +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        }else if(host.indexOf("lpt.liepin.com/cvview/showresumedetail") != -1){
            $html = $(document.body).clone();
            $html.find('#header-lpt,.title-info,.tabs-switch,.btns.clearfix,#person-test,.fun-list,.lie-plus-wrap').remove();
            var html = $html.html();
            fName =
              "lp_" +
              $(".title-info .float-left small").eq(1)
                .text() +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
            netResumeId = $(".title-info .float-left small").eq(1).text();
            netResumeFrom = '猎聘HR版';
        } else if (
            host.indexOf("highpin.cn/ResumeManage") != -1 ||
            host.indexOf("highpin.cn/SearchResume") != -1
        ) {
            var html = $(document.body).html();
            netUrl = 'https://h.highpin.cn/SearchResume/SearchResumeInfo?seekerUserID='+$('#SeekerUserID').val()+'&resumeID='+$('#ResumeID').val();
            netResumeId = $('#SeekerUserID').val()+'+'+$('#ResumeID').val();
            netResumeFrom = '卓聘';
            fName =
              "zp_" +
              $(".resume-num")
                .text()
                .slice(5) +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (
            host.indexOf("fenjianli.com") != -1 &&
            host.indexOf("detail") != -1
        ) {
            var html = $("iframe#tabNav").contents().find('body').html();
            netResumeId = $("iframe#tabNav").contents().find('body').find('input[name="resume_id"]').val();
            netResumeFrom = '纷简历';
            fName =
              "fjl_" +
              $("#resume-name-id span")
                .text()
                .slice(3) +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("zhaopin.com") != -1) {
            var $html = $(document.body).clone();
            $html.find('.resume-setting__trigger-label,.resume-setting__panel').remove();
            if(host.indexOf('/resume/manage/')!=-1){
                var html = $html.find('.dave-resDetail-cont').html();
            }else{
                $html.find('.lie-plus-wrap,.plus-resume-list').remove();
                var html = $html.html();
            }
            netResumeId = $(".resume-content__header span span.resume-content--letter-spacing").text().slice(3);
            netResumeFrom='智联';
            fName =
              "zl_" +
              $(".resume-content__header span span.resume-content--letter-spacing")
                .text()
                .slice(3) +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("jianlika.com/Resume") != -1) {
            var html = $("div.content").html();
            netResumeId = $(".meta li:first")
                .text()
                .slice(5);
            netResumeFrom='简历咖';
            fName =
              "jlk_" +
              $(".meta li:first")
                .text()
                .slice(5) +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("easy.lagou.com") != -1) {
            var html =
                $(".detail-content").html() ||
                $(".mr_myresume_l").html() ||
                $("body").html();
            netResumeId = $(".add-chat-list").attr("data-resumeidout");
            netResumeFrom='拉勾';
            fName =
              "lg_" +
              $(".add-chat-list").attr("data-resumeidout") +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("linkedin.com") != -1) {
            var $html = $('.body').clone();
            $html.find('.pv-treasury-carousel').remove();
            $html.find('.pv-entity__bullet-item').remove();
            $html.find("#experience-section").find('.pv-profile-section__card-item.pv-position-entity.ember-view').find('.pv-entity__summary-info').each(function(i,item){
                $(item).find('h3').appendTo($(item).find('h4:first'));
            });
            var html =
                "姓名:" +
                $("artdeco-modal-header").text() +
                $("artdeco-modal-content").text()+
                $html.find("#experience-section").text().replace(/任职时长/g, "").replace(/[\n\r]/gi,'') +'\n'+
                $html.find("#education-section").text().replace(/[\n\r]/gi,'');
            var rut = host.match(/.+in\/(.[^\/]+)\/?/);
            try{
                netResumeId = rut[1];
            }catch(ex){
            }
            netResumeFrom='领英';
            fName =
              "linked_" +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("dajie.com") != -1) {
            var html = $("#apply-resume-in")
                .contents()
                .find(".profile-in")
                .html();
            netResumeId = $("#apply-resume-in")
                .contents()
                .find('#resumeId').val();
            netResumeFrom='大街';
            fName =
              "dj_" +
              $("#apply-resume-in")
                .contents()
                .find("#encryptedId").val() +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("xmrc.com.cn") != -1) {
            var html = $("#content").html();
            var _id = this.base.getParam(window.location.href.slice(window.location.href.indexOf("?")+1))["TalentID"] || this.base.getParam(window.location.href.slice(window.location.href.indexOf("?")+1))["ID"];
            netResumeId = _id;
            netResumeFrom='厦门人才网';
            fName =
              "xmrc_" +
              _id +
              "_" +
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else if (host.indexOf("maimai.cn/contact/detail") != -1) {
            var $html = $(".PCcontent").clone();
            $html.find('.contact_detail_name span').text($html.find('.contact_detail_name span').text()+' ');
            $html.find('.icon_mai_number_gray').text('英文名:'+$html.find('.icon_mai_number_gray').text());
            $html.find('.icon_phone_gray').text('联系电话:'+$html.find('.icon_phone_gray').text());
            $html.find('.icon_email_gray').text('email:'+$html.find('.icon_email_gray').text());
            $html.find('.font-12.o-hidden.m-t-2.text-muted').text('行业:'+$html.find('.font-12.o-hidden.m-t-2.text-muted').text());
            $html.find('.panel-default').each(function(){
                if($(this).text().indexOf('我要点评')!=-1||$(this).text().indexOf('好友印象')!=-1||$(this).text().indexOf('的人还看了')!=-1||$(this).text().indexOf('职业标签')!=-1||$(this).text().indexOf('还没有人点评过胡均')!=-1){
                    $(this).remove();
                }
                if($(this).text().indexOf('工作经历')!=-1){
                    $(this).find('.list-group-item-heading .title').each(function(){
                        var txt = $(this).text();
                        var $t = $(this).next('.list-group-item-text').find('.text-muted');
                        $t.text($t.text().replace('，','，公司名称:'+txt+'，职位:'));
                        $t.text($t.text()+' ');
                        $(this).text('');
                        var $work = $(this).closest('.list-group-item-heading').nextAll('.short-text');
                        $work.text('工作职责:'+$work.text());
                    })
                }
            });
            $html.find('.friend_tips').remove();
            var html = $html.html();
            var rut = host.match(/.+detail\/(.[^\/\?#]+)\/?/);
            try{
                var _id = rut[1];
            }catch (ex){
                var _id= '';
            }
            netResumeId = _id;
            netResumeFrom='脉脉';
            fName =
              "maimai_" +_id+
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        }else if (host.indexOf("maimai.cn/resume") != -1) {
            var $html = $(".resumeLeft").clone();
            $html.find('.resInfo.workInfo li').each(function(){
                $(this).find('em:first').prependTo($(this));
            });
            var html = $html.html();
            var rut = host.match(/.+detail\/(.[^\/\?#]+)\/?/);
            try{
                var _id = rut[1];
            }catch (ex){
                var _id= '';
            }
            netResumeId = _id;
            netResumeFrom='脉脉';
            fName =
              "maimai_" +_id+
              new Date().getTime() +
              Math.floor(Math.random() * 10000);
        }else if (host.indexOf("51job.com") != -1 && host.indexOf("ResumeView") != -1) {
            var $html = $(document.body).clone();
            $html.find('#spase,#wyntgg,#MenuContent,#divRecom').remove();
            var html = $html.html();
            var _id =$.trim($('.box1 span:first').text().replace('ID:',''));
            netResumeId = _id;
            netResumeFrom='51job';
            fName =
              "51job_" + _id+new Date().getTime() +
              Math.floor(Math.random() * 10000);
        } else {
            this.showSuport();
            return false;
        }
        $("#J_PlugCheckFlg").remove();
        // 存储dom结构
        _this.resumeHtml = html;
        _this.fName  =fName;
        var fullHtmlDom = $('html').clone();
        fullHtmlDom.find('.lie-plus-wrap,.plus-resume-list').remove();
        fullHtmlDom.find('script').each(function(i,item){
            var _src = $(item).attr('src');
            if(_src && _src.indexOf('js/router.js')!=-1){
                item.remove();
            }
            if(_src && _src.indexOf('http')==-1){
                $(item).attr('src','https:'+ _src);
            }
        })
        fullHtmlDom.find('link').each(function(i,item){
            var _href = $(item).attr('href');
            if(_href && _href.indexOf('http')==-1){
                $(item).attr('href','https:'+ _href);
            }
        })
        _this.resumeFullHtml = fullHtmlDom.prop('outerHTML');
        _this.netInfo = {
            netUrl:netUrl,
            netResumeFrom:netResumeFrom,
            netResumeId:netResumeId
        };
        chrome.runtime.sendMessage({
            message: "putRequest",
            ajaxRequestData: {
                url: 'http://ps.lie360.com/my/resumeSimilarity',
                type: 'post',
                data: {
                    file: html,
                    userId: _this.lieUserInfo.userId,
                    netUrl:netUrl,
                    version:_this.version,
                    netResumeFrom:netResumeFrom,
                    netResumeId:netResumeId
                },
                cache: false,
                dataType:'json',
                markId:'checkHadFlgCb'
            }
        });
        /*chrome.runtime.sendMessage({
            html: html,
            userId: _this.lieUserInfo.userId,
            message: "checkHadFlg"
        });*/
        $(document.body).append(
            '<div class="plug-check-flg" id="J_PlugCheckFlg"><span class="loading"><i>&#164;</i></span>正在检测该简历是否已存在您的全猎网公司库中...</div>'
        );
    },
    checkHadFlgCb: function (request) {
        var _this = this;
        var data = request.data;
        if (data.status == "MSG_LOGIN_FAILD") {
            $("#J_PlugCheckFlg").remove();
            _this.toLogin();
            return;
        } else if (data.status != "success") {
            $("#J_PlugCheckFlg").remove();
            dialog.alert(data.error_msg || "检测失败,请稍后再试");
            return;
        }
        if (data.isExist) {
            var a = data.resumeFrom == "0" ? "" : "&resumeFrom=1";
            // var _u = 'http://ps.lie360.com/my/viewResume?resumeId='+data.resumeId+a;
            // $('#J_PlugCheckFlg').html('该简历已存在您的全猎网公司库内,<a target="_blank" href="'+_u+'">点击查看</a>');
            // data.resumeArr
            $("#J_PlugCheckFlg").remove();
            var htmlArr = [];
            htmlArr.push('<div class="resume-list-wrapper"><ul class="resume-list">');
            for (var i = 0; i < data.resumeArr.length; i++) {
                var _resumeFrom = data.resumeArr[i]["resumeFrom"] || "0";
                var _last = "";
                if (data.resumeArr.length - 1 === i) {
                    _last = "last";
                }
                var _url = "";
                if (_resumeFrom == 1 || _resumeFrom == "1") {
                    _url =
                        "http://ps.lie360.com/my/viewResume?resumeId=" +
                        data.resumeArr[i]["resumeId"] +
                        "&resumeFrom=" +
                        _resumeFrom;
                } else {
                    _url =
                        "http://ps.lie360.com/my/viewResume?resumeId=" +
                        data.resumeArr[i]["resumeId"];
                }
                htmlArr.push(
                    '<li class="resume-item ' +
                    _last +
                    '" data-resumeid="' +
                    data.resumeArr[i]["resumeId"] +
                    '" data-resumeFrom="' +
                    _resumeFrom +
                    '"><div class="plus_top clearFix1"><a target="_blank" href="' +
                    _url +
                    '" class="plus_name plus_fl">' +
                    data.resumeArr[i]["personName"] +
                    '</a><div class="control plus_fr"><a target="_blank" href="' +
                    _url +
                    '" class="plus_view">查看</a><span class="vertical-line">|</span><a href="javascript:;" class="J_update plus_update">更新</a></div></div><div class="plus_bottom">');
                var _workInfo =data.resumeArr[i]["workInfo"];
                if(_workInfo && _workInfo.length>0){
                    var _ws = _workInfo[0].startDate ||'';
                    var _we = _workInfo[0].endDate ||'';
                    var _wc= _workInfo[0].company || '';
                    var _wt= _workInfo[0].title || '';
                    htmlArr.push('<p><span class="plus_company">'+_ws +'~'+_we +'&nbsp;&nbsp;'+ _wc +'&nbsp;&nbsp;'+ _wt +'</span></p>')
                }
                var _educationInfo =data.resumeArr[i]["educationInfo"];
                if(_educationInfo && _educationInfo.length>0){
                    var _es = _educationInfo[0].startDate ||'';
                    var _ee = _educationInfo[0].endDate ||'';
                    var _ec= _educationInfo[0].school || '';
                    var _et= _educationInfo[0].speciality || '';
                    var _eee= _educationInfo[0].education || '';
                    htmlArr.push('<p><span class="plus_school">'+_es +'~'+_ee +'&nbsp;&nbsp;'+ _ec +'&nbsp;&nbsp;'+ _et+'&nbsp;&nbsp;'+ _eee + '</span></p>')
                }
                htmlArr.push('</div></li>');
            }
            htmlArr.push("</ul></div>");
            // `
            // 	<div class="resume-list-wrapper">
            // 			<ul class="resume-list">
            // 				<li class="resume-item">
            // 					<div class="top clearFix">
            // 						<a href="#" class="name fl">xxx</a>
            // 						<div class="control fr">
            // 							<a href="javascript:;" class="view">查看</a>
            // 							<span class="vertical-line">|</span>
            // 							<a href="javascript:;" class="update">更新</a>
            // 						</div>
            // 					</div>
            // 					<div class="bottom">
            // 						<span class="company">公司名</span>
            // 						<span class="interval">-</span>
            // 						<span class="school">学校名</span>
            // 					</div>
            // 				</li>
            // 			</ul>
            // 	</div>
            // 	`
            $('.plus-resume-list').remove();
            dialog
                .layer({
                    skin: "plus-resume-list",
                    isOverlay: false,
                    isLookScreen: false
                })
                .setTitle("检测到可能存在的简历")
                .setContent(htmlArr.join(""))
                .show();

            // 更新
            $(".resume-list-wrapper").on("click", ".J_update", function () {
                var $this =$(this);
                dialog.confirm('更新操作会将用该简历与检测的简历进行智能合并,请确定两份为同一人选简历,点击确定继续更新',function(flg){
                    if(flg){
                        var $item = $this.closest(".resume-item");
                        var resumeId = $item.data("resumeid");
                        var resumeFrom = $item.data("resumefrom");
                        // _this.$a.find('#J_GatherToLie').text('更新到全猎网中').data('ing',false);
                        if (resumeFrom == "1" || resumeFrom == 1) {
                            $(document.body).append(
                              '<div class="plug-check-flg" id="J_PlugCheckFlg"><span class="loading"><i>&#164;</i></span>正在更新到您的全猎网公司库中...</div>'
                            );
                        } else {
                            $(document.body).append(
                              '<div class="plug-check-flg" id="J_PlugCheckFlg"><span class="loading"><i>&#164;</i></span>正在更新到您的全猎网个人库中...</div>'
                            );
                        }
                        // 插件发送请求更新
                        /*chrome.runtime.sendMessage({
                         userId: _this.lieUserInfo.userId,
                         file: _this.resumeHtml,
                         resumeId: resumeId,
                         resumeFrom: resumeFrom,
                         message: "updateResume"
                         });*/
                        chrome.runtime.sendMessage({
                            message: "putRequest",
                            ajaxRequestData: {
                                url: 'http://ps.lie360.com/my/resumeStrUpdate',
                                data: {
                                    file: _this.resumeHtml,
                                    userId: _this.lieUserInfo.userId,
                                    resumeId:resumeId,
                                    resumeFrom:request.resumeFrom||'0',
                                    netUrl:_this.netInfo.netUrl,
                                    netResumeFrom:_this.netInfo.netResumeFrom,
                                    netResumeId:_this.netInfo.netResumeId,
                                    version: _this.version,
                                    fullHtml:_this.resumeFullHtml,
                                    fName:_this.fName
                                },
                                type: 'post',
                                cache: false,
                                markId:'updateResumeCb'
                            }
                        });
                    }
                })
            });
        } else {
            $("#J_PlugCheckFlg").html(
                '未在您的全猎网公司库中检测到该简历,<a href="javascript:;" id="J_PlusGetBtn">点击收集</a>'
            );
            $("#J_PlusGetBtn").on("click", function () {
                _this.getResume();
            });
        }
    },
    publishPost: function (type) {
        if (type == "LP") {
            chrome.runtime.sendMessage({
                message: "pubLPPost"
            });
        }
    },
    getVersion: function () {
        var lv = $.cookie("liePlus");
        return lv;
    },
    updateResumeCb: function (request) {
        var _this = this;
        $("#J_PlugCheckFlg").remove();
        if (!request.data || request.data.status !== "success") {
            dialog.alert(data.error_msg || "更新出错,请稍后再试");
        } else {
            dialog.alert("更新成功");
        }
    }
};

var main = new Main().init();
