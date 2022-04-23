Dialog 弹出层
===================

### Dialog参数配置
<pre>
{
    html: '', 弹出层自定义html内容
    skin: '', 皮肤class名
    width: 400, 宽
    height: 'auto', 高
    isOverlay: true, 是否显示遮罩
    closeBtn: true, 是否显示关闭按钮
    isHasTitle: 是否显示title
    isSetMax: 是否设置高度最大值
    isLookScreen： 是否锁定屏幕
    zIndex: 99999 弹出层z-index值
}
</pre>

### Dialog方法

* createOverlay: 创建遮罩
* removeOverlay: 删除遮罩
* setHtml: 设置html
* setTitle: 设置title
* setContent: 设置内容
* addBtns: 添加按钮
* show: 显示
* hide: 隐藏
* remove: 删除
* posUpdate: 位置更新
* setMaxHeight: 设置最大高度
* getMaxHeight: 获取最大高度
* getScrollbarWidth: 获取滚动条宽度
* lookScreen: 锁定屏幕
* unLookScreen: 解锁屏幕


### 示例
<pre>
var _dialog = dialog.layer();
_dialog.setTitle('xxx').setContent('&lt;h2&gt;hi&lt;/h2&gt;&lt;div&gt;hello world!&lt;/div&gt;').show();
var _dialog1 = dialog.layer({
    html: '&lt;div&gt;&lt;h2&gt;hi&lt;/h2&gt;&lt;div&gt;hello world!&lt;/div&gt;&lt;/div&gt;',
    skin: 'ui-test-skin',
    width: 500,
    height: 300
});

_dialog1.show();
</pre>

##### 模拟alert
<pre>
dialog.alert('test!');
dialog.alert('test!', function(){});
dialog.alert('test!', {}, function(){});
</pre>

##### 模拟confirm
<pre>
dialog.confirm('test!');
dialog.confirm('test!', function(){}, function(){});
dialog.confirm('test!', function(flag){
    if(flag){}else{}
});
dialog.confirm('test!', {}, function(){}, function(){});
</pre>