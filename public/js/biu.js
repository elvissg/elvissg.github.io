$(function(){ 
	/*
	 * 滚动相关
   * 视差背景与动态显示文章列表
	 */

  const winHeight = window.screen.height;
  parallaxScroll();
  $(window).on("scroll", parallaxScroll);

	function parallaxScroll(){
    var headerBgPosition = document.body.scrollTop;
    $('.header-pc-wra').css("background-position", "0 "+ headerBgPosition * 0.2+"px");
		$('.article').not('.animated').each(function(){
			if (headerBgPosition + winHeight >= $(this).offset().top){
				$(this).addClass('animated bounceInUp');
			};
		});
  };


  /*
   * header随鼠标微动
   */
  const screenHeight = window.screen.height;
	const screenWidth = window.screen.width;
	$('.header-pc').mousemove(function(e){
		$('.info-pc').css('transform','translate3d('+ ((e.pageX/screenWidth)*4-2)+'%,'+((e.pageY/screenHeight)*4-2) +'%,0)');
	});

});
