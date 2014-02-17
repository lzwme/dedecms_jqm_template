//(function($){
	//收藏
	var fav = {
		rc4Key: 'lzw_',	// rc4 加密key
		prefix: "lzw_",	//key 前缀
		storage: localStorage || window.localStorage,
		add: function(key, value){
			this.storage.setItem(this.adjustKey(key), value);
			return this;
		},
		get: function(key){
			return this.storage.getItem(this.adjustKey(key));
		},
		getAll: function(){
			var key, favAll={}, length = this.storage.length;
			for (var i = length - 1; i >= 0; i--) {
				key = this.storage.key(i);
				if (key.search(this.prefix) != -1) {
					key = key.slice(this.prefix.length);
					favAll[key] = this.get(key);
				};
			};
			return favAll;
		},
		genKey: function(link){
			var link = link || window.location.href;
			return $.rc4EncryptStr(this.rc4key,link);
		},
		alter: function(key, value){
			this.add(key, value);
			return this;
		},
		remove: function(key){
			this.storage.removeItem(this.adjustKey(key));
			return this;
		},
		removeAll: function(){
			var favAll, key, length = this.storage.length;
			favAll = this.getAll();
			if ($.isEmptyObject(favAll)) {
				return this;
			}
			for(key in favAll){
				this.remove(key);
			}
			return this;
		},
		adjustKey: function(key){
			if (key && key.search(this.prefix) == -1) {
				key = this.prefix + key;
			}
			return key;
		}
	}
	//收藏动作事件
	var favActionHandle = {
		init: function(){
			//加入收藏
			$(document).on('click', '#favAdd', $.proxy(this.fav_add, this));

			//清除全部收藏
			$(document).on('click', '#favRemoveAll', $.proxy(this.fav_remove_all,this));

			//生成收藏列表
			$(document).on('panelopen', '#fav-panel', favActionHandle.gen_fav_list);

			//取消收藏
			$(document).on('click', '#favRemove', function(event) {
				fav.remove(fav.genKey());
				$(this).attr('id', 'favAdd').removeClass('ui-btn-active').find('.ui-btn-text').text("加入收藏");
			});
			$(document).on('click', '.fav-remove', function(event) {
				fav.remove($(this).attr('key'));
				$(this).parent().hide().remove();
			});

			$(document).on('pageshow', $.proxy(function() {
				//当前页面已收藏检测
				var favAdd = $('#favAdd');
				if (this.test_cur_fav() && favAdd.length != 0) {
					favAdd.attr('id', 'favRemove').addClass('ui-btn-active').find('.ui-btn-text').text('取消收藏');;
				};	
			},this));
			
			return this;
		},
		fav_add: function(event){
			event.preventDefault();
			
			fav.add(fav.genKey(), JSON.stringify({
				title: $('a#favAdd').attr('title'),
				link: window.location.href
			}));

			$('a#favAdd').attr('id', 'favRemove').addClass('ui-btn-active').find('.ui-btn-text').text('取消收藏');
			return this.notify('收藏成功！');
		},
		fav_remove_all: function(event){
			fav.removeAll();
			$('#favList').empty();
			return this.notify('成功清除全部收藏！');
		},
		gen_fav_list: function(){
			var favAll, itemObj, _appendCode = '<li><a href="#">暂无收藏</a></li>';
			favAll = fav.getAll();
			if (!$.isEmptyObject(favAll)) {
				_appendCode = '';
				for(var key in favAll){
					itemObj = $.parseJSON(favAll[key]);
					_appendCode += '<li><a href="'+ itemObj.link +'" title="'+itemObj.title+'"><h3>'+itemObj.title+'</h3></a><a href="#" key="'+ key +'" class="fav-remove" data-icon="delete" data-theme="a">删除</a></li>';
				}
			}
			_appendCode += '<li></li>';
			$('#favList').html(_appendCode).listview('refresh');
			return this;
		},
		//当前页面已收藏检测
		test_cur_fav: function(){
			if (fav.get(fav.genKey())) {
				return true;
			};
			return false;
		},
		notify: function(str){
			alert(str);
			return this;
		}
	}
	//功能函数集
	var fun={
		setShare: function(event){
			var urls = document.location,
				loca = escape( document.location),
				host = urls.toString().replace(/\?(.*)/, ''),
				pic=$('.article img:first').attr('src') || '';

			if(!event || !event.target) event.target = 'body'; 
			$(event.target).find("#share-panel ul:last li:last").before("<li><a data-rel='external' href='http://v.t.sina.com.cn/share/share.php?appkey=1602484039&url=" + loca + "&title=" + title + "&ralateUid=2880199732&source=" + webname + "&sourceUrl=" + host + "&content=utf8&pic=" + pic + "' target='_blank' title='分享生成的二维码到新浪微博' class='tsina'>新浪微博</a></li>"
				+ "<li><a href='http://widget.renren.com/dialog/share?resourceUrl=" + loca + "&srcUrl="+escape(host)+"&pic=" +pic+ "&title=" + title + "' target='_blank' title='分享到人人网' class='renren'>人人网</a></li>"
				+ "<li><a href='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + loca + "&title=" + title + "&decs=" + title + "&site=" + host + "&pics=" + pic + "' target='_blank' title='分享到QQ空间' class='qzone'>QQ空间</a></li>"
				+ "<li><a  href='http://connect.qq.com/widget/shareqq/index.html?url=" + loca + "&desc=" + title + "&title=" + title + "&site=" + host + "&pics=" + pic + "' target='_blank' title='分享给QQ好友或QQ群' class='py'>QQ好友/QQ群</a></li>"
				+ "<li><a href='http://share.v.t.qq.com/index.php?c=share&a=index&appkey=801406681&url=" + loca + "&site=" + host + "&pic=" + pic + "&title=" + title + "' target='_blank' title='分享到腾讯微博' class='tqq'>腾讯微博</a>"
				+ "<li><a href='http://t.sohu.com/third/post.jsp?content=utf-8&url=" + loca + "&title=" + title + "&pic=" + pic + "' target='_blank' title='分享到搜狐微博' class='tsouhu'>搜狐微博</a></li>"
				+ "<li><a href='http://t.163.com/article/user/checkLogin.do?link=" + loca + "&source=" + webname + "&info=" + title + " " + loca + "' target='_blank' title='网易微博' class='t163'>网易微博</a>"
				+ "<li><a href='http://profile.live.com/badge/?url=" + loca + "&Title=" + title + "&screenshot=" + pic + "' target='_blank' title='分享到MSN' class='msn'>MSN</a></li>"
				+ "<li><a href='http://www.douban.com/recommend/?url=" + loca + "&title=" + title + "' target='_blank' title='分享到豆瓣' class='douban'>豆瓣</a></li>"
				+ "<li><a href='http://tieba.baidu.com/i/sys/share?link=" + loca + "&type=video&title=" + es_tit + "' target='_blank' title='分享到i贴吧' class='itieba'>百度贴吧</a></li>");
		},
		back: function(event){
			history.back(
			 $.mobile.loading('show', {
		        text: '后退...', //加载器中显示的文字  
		        textVisible: true, //是否显示文字  
		        theme: 'a',        //加载器主题样式a-e  
		        textonly: 0,   //是否只显示文字  
		        html: ""           //要显示的html内容，如图片等  
		    })); 
		    setTimeout(function(){
		    	$.mobile.loading('hide',500);
		    },500);
		},
		forward: function(event){
			history.forward(
			 $.mobile.loading('show', {
		        text: '前进...', //加载器中显示的文字  
		        textVisible: true, //是否显示文字  
		        theme: 'a',        //加载器主题样式a-e  
		        textonly: 0,   //是否只显示文字  
		        html: ""           //要显示的html内容，如图片等  
		    })); 
		    setTimeout(function(){
		    	$.mobile.loading('hide',500);
		    },500);
		},
		screenScroll: function(event){
			event.stopPropagation();
			//console.log(111111);
			if(event.clientY < document.body.clientHeight/3){
			//单击了页面上半部分,则向上滑动.前后100px区域内
				if(document.body.scrollTop<1) return;
				var scrollPosY = document.body.scrollTop - document.body.clientHeight + 100;
				$.mobile.silentScroll(scrollPosY);
			}else if(event.clientY > document.body.clientHeight*2/3){
				var scrollPosY = document.body.scrollTop + document.body.clientHeight - 100;
				if(scrollPosY < document.body.scrollHeight){
					//顶部覆盖的高度+可见高度<网页体高度
					$.mobile.silentScroll(scrollPosY,500);
				}
			}
		}
	}

	//绑定
	$(document).on("mobileinit", function(){
		//配置初始化
		$.extend(  $.mobile , {
			defaultPageTransition: 'none',
			ajaxEnabled: false
	  	});

		/*/打开上次浏览的页面
		if(localStorage){
			var hisUrl = localStorage.getItem('history.url');
			if(hisUrl && hisUrl != document.location.href && hisUrl.replace('http://'+document.location.host,'') != '/wap.php'){
				localStorage.removeItem('history.url');
				if (confirm('是否恢复上次浏览的页面？')) {
					document.location.href = hisUrl;
				}
			}
		}*/

		favActionHandle.init();

	});

	/*窗口关闭时，记住当前页面url,以便再次打开时恢复
	window.onbeforeunload = function(event){
		console.log('窗口关闭');
		if(localStorage){
			localStorage.setItem('history.url',document.location.href);
		}
	}
	/*$(document).on('pageshow', function(event,data){
		//记住当前页 URL
		if(localStorage){
			localStorage.setItem('history.url',document.location.href);
		}
	});*/

	$(document).on( "pagebeforecreate", function( event, data ){
		//分享列表设置
		fun.setShare(event);
		/*/图片添加链接
		$('div.article img').each(function (i) {
			$(this).wrap('<a id="img_'+i+'" data-rel="dialog" href="' + $(this)[0].src + '"></a>');	
		});//*/
		//广告
		$(event.target).find('#wap_ad_footer').html($('#ad_hide iframe').clone());
	});

	//内容页图片单击的处理
	$( document ).on( "click", "div.article img", function(e){
		e.stopPropagation();
		
		var imgHeight = $(this).height();
		var imgWidth = $(this).width();
		if(imgHeight > document.body.clientHeight) imgHeight = document.body.clientHeight;
		if(imgWidth > document.body.clientWidth) imgWidth = document.body.clientWidth;

		$.mobile.loading('show', {
		        text: '', //加载器中显示的文字
		        textVisible: true, //是否显示文字  
		        theme: 'a',        //加载器主题样式a-e  
		        textonly: 0,   //是否只显示文字  
		        html: '<img src="'+$(this).attr('src')+'" style="max-width:'+ (imgWidth-20) +'px;max-height:'+ (imgHeight-20) +'px" />'           //要显示的html内容，如图片等 
		    } );//*/
		$('.ui-loader').css({'width':$('.ui-loader img').width(),'height':$('.ui-loader img').height(),'top':(document.body.clientHeight - imgHeight)/2,'left':(document.body.clientWidth - imgWidth)/2,'margin':0});
	}).on("click", '.ui-loader', function(e){
		$.mobile.loading('hide');
		$('.ui-loader').css({'width':'200px','height':'auto','top':'30%','left':'50%','margin-left':'-100px'});
	});

	//左右滑动
	$( document ).on( "swipeleft",fun.back);
	/*容易出错，注释掉
	$( document ).on( "swiperight",fun.forward); 
	});//*/

	$(document).on("click", "#menu-panel #mp-back",fun.back);
	$(document).on("click", "#menu-panel #mp-forward",fun.forward);
	//轻点屏幕，文章内容滚屏，支持动态生成的元素
	//$(document).on("click", "div.article",fun.screenScroll);
	
//})(jQuery);