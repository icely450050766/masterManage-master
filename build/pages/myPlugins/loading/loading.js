var loading = (function($){

    // 生成元素
    function init(){

        if( $('.loading').length ) return; // 已经在显示 .loading了

        $('body').append('<div class="loading"><div class="loading-mark"></div></div>');
		
        var _temp = Math.PI / 8; //  2 * PI / 16
        var _angleArr = [ _temp, 3*_temp, 5*_temp, 7*_temp, 9*_temp, 11*_temp, 13*_temp, 15*_temp];// 8个点的角度

        // 加入 加载点
        for( var i=0; i < 8; i++ ){

            $loadingSpot = $('<div class="loading-spot"></div>');

            // 加载点位置散开
            $loadingSpot.css({
                top : Math.sin( _angleArr[i] ) * 2.5 + 'rem', // 2.5是半径
                left : Math.cos( _angleArr[i] ) * 2.5 + 'rem'
            });

            $('.loading').append( $loadingSpot );
        }

        // 设置 加载点位置 屏幕居中
        $('.loading-spot').css({
            top : '+=' + $(window).height() / 2.5 + 'px',
            left : '+=' + $(window).width() / 2 + 'px'
        })

    }

    function show(){
        init();
        console.log('loading show');
    }

    function hide(){
        $('.loading').remove();
        console.log('loading hide');
    }

    return{ // 外部调用
        show : show,
        hide : hide
    }

})( jQuery );