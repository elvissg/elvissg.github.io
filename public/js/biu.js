$(function(){
	(function() {
		var lastTime = 0;
		var vendors = ['webkit', 'moz'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
				var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}());

	const screenHeight = window.screen.height;
	const screenWidth = window.screen.width;

	$('.article').addClass('bounceInUp');
	var parallaxScroll = function (){
		var headerBgPosition = document.body.scrollTop;
		$('.header-pc-wrap').css("background-position", "0 "+ headerBgPosition * 0.2+"px");
		$('.article:not(.animated)').forEach(function(el){
			if (headerBgPosition + screenHeight >= el.offsetTop){
				$('.article:not(.animated)').addClass('animated');
			};
		});

	};

	var backTop = function() {
		var headerBgPosition = document.body.scrollTop;
		if(headerBgPosition > 600){
			$('.back-top').show();
		}
		else {
			$('.back-top').hidden();
		}
	}

	$('.back-top').click(
			function(){

        var animation = window.requestAnimationFrame
				var scrollToTop = function(){
							var top = document.body.scrollTop;
							if(top > 0){
								document.body.scrollTop -= top/3;
								animation(scrollToTop)
							}
				}
				animation(scrollToTop)
			})
	window.addEventListener("scroll", parallaxScroll);
	window.addEventListener("scroll", backTop);

	/*
		 $('.header-pc').mousemove(function(e){
		 $('.info-pc').css('transform','translate3d('+ ((e.pageX/screenWidth)*4-2)+'%,'+((e.pageY/screenHeight)*4-2) +'%,0)');
		 });
		 */
});
