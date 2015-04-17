dedecms_jqm_template
====================

dedecms织梦内容管理系统手机版模板，基于jquery mobile 开发

特性简介：
----------------------------
- 漂亮的界面、切换效果；
- 简单实现的上下文链接;
- 手势控制、文章页触控翻页；
- 菜单设置；
- 社交分享；
- 本地收藏；
- 伪静态支持；
- 图库栏目支持；
- 多主题切换；
- +++

更多实用功能继续增加中！

安装方法：
----------------------------

解压缩下载的压缩包，复制到根目录进行替换即可。

- wap 方式

	直接访问：http://网址/wap.php

- 伪静态方式

需要配置服务器伪静态，nginx 配置参考如下：
```
	#mobile
	rewrite ^/m/?$  /wap.php?tmpl=m last;
	rewrite ^/m/list/(\d+)/?$  /wap.php?action=list&typeid=$1&tmpl=m last;
	rewrite ^/m/article/(\d+)/(\d+)/?$  /wap.php?action=article&typeid=$1&id=$2&tmpl=m last;
	rewrite ^/m/images/(\d+)/(\d+)/?$  /wap.php?action=images&typeid=$1&id=$2&tmpl=m last;
	rewrite ^/m/wapsearch/(\d+)/?$  /wap.php?action=list&typeid=$1&tmpl=m last;
	rewrite ^/m/p/(\d+)/(\d+)/?$ /wap.php?p=$1&pz=$2&tmpl=m last;
	#wap 方式使用重定向
	rewrite ^/wap(.*) /m permanent;
	#rewrite ^/wap/?(\.php)?(.*)    /wap.php$2 break;
```

其他服务器请参照自写。配置成功后，以如下方式访问：

	http://网址/m/

注意事项：
----------------------------
1. 基于dedecms 织梦的 wap 进行了少许的二次开发，替换前请备份如下文件：

- templets/wap/ 目录
- wap.php 文件

2. 关于界面，具体可看演示或截图；

3. 关于搜索

图片内容页的搜索使用了“图库集”模型，如有提示“自定义搜索模型不存在”，需作如下操作：

	后台管理 -> 核心 -> 频道模型 -> 内容模型管理 -> 图库集 -> 自定义搜索小图标 -> 进入后点击“确定”按钮即可。

4. 关于主题

自带了五套简单设计的主题，你也可以自定义你的主题。步骤参考如下：

a. 打开如下地址，进入主题定制网站页面：

	http://themeroller.jquerymobile.com/

b. 点击 “Import” 按钮，弹出主题导入对话框，下拉列表中选择 1.4.5 版本；

c. 打开如下文件并复制内容，将其粘贴进对话框中

	templets\asset\jmobile\themes\lzw_dede_wap.css

操作成功，即可看到 A-E 的五种主题，分别对应侧边栏的五种主题设置。

d. 修改侧边栏的不同主题设置，可实时看到对应主题效果的变化。

e. 主题定制完成，点击 Download 按钮下载主题，解压并复制替换 templets\asset\jmobile\themes\ 目录中的文件。

相关：
----------------------------
站点：http://w.lzw.me        http://lzw.me

演示：http://w.lzw.me/wap

支持：http://lzw.me/a/dedecms-wap-templet-jquery-mobile.html

作者：@任侠 @志文工作室

日期：2013-10-25

更新：2015-04-16
