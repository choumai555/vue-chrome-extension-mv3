/**
 * Created by hale_v on 16/11/29.
 */

if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
}
var Popup = function(){
    this.version = '3.6';
};
Popup.prototype={
    init:function(){
        //this.checkVer();
        this.handle();
    },
    handle:function(){
        this.getLoginInfo();
        var _this = this;
        /*$('#J_SubOpt').click(function(){
            var sd = $('#J_StartDate').val();
            var st = $('#J_StartTime').val();
            var ed = $('#J_EndDate').val();
            var et = $('#J_EndTime').val();
            var startTime = new Date(sd+' '+st).getTime();
            var endTime = new Date(ed+' '+et).getTime();
            var allStore = $('#J_AllStore').prop('checked');
            /!*chrome.runtime.sendMessage("Hello",function(res){
                document.write(res);
            })*!/
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: _this.type,st:startTime,et:endTime,url:_this.originUrl || tabs[0].url,allStore:allStore,backup:_this.backup}, function(response) {
                    //console.log(response.farewell);
                });
            });
        });*/
    },
    checkVer:function(){
        $('#J_CurVer span').text(this.version);
        var _this = this;
        var html = '';
        var conf = $.ajax({
            url:'http://10.204.2.158/soft/lcwa-conf.json?t='+new Date().getTime(),
            cache:false,
            success:function(data){
                data = JSON.parse(data);
                var ver = data.version;
                if(ver == _this.version){
                    html += "此版本已经是最新版本!";
                }else{
                    html += "<span style='color:red'>此版本不是最新版本,<a style='color:#4183C4' href='http://10.204.2.158/soft/lcwa-plug.crx?v="+ver+"' target='_blank'>点此下载</a>后安装更新</span>";
                }
                $('#J_VerUp').html(html);
            },
            error:function(data){
                $('#J_VerUp').html('请检查网络状态!');
            }
        });
    },
    getParam:function(url,name){
        var reg = new RegExp(name+"="+ "(.[^&#]*)");
        return reg.exec(url);
    }
};

var popup = new Popup().init();