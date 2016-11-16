/**
 * Created by Administrator on 2016/11/1.
 */
// 显示大图插件（某一时刻只显示一组大图，因此不需要用类，用对象实现即可。）
// 用“闭包” 实现 多个对象 的功能 （一个对象 根据情况 修改为 其他多个对象）

var showBigImg = ( function($){
    return{

        $showBigImg: null,
        imgSrcArr: [],// 图片 src数组
        currentIndex: 0,// 当前显示图片下标

        // 初始化（参数：所有小图的公共父亲，可以是祖父或以上层级）（闭包 实现多个对象）
        init: function( $imgParent ){

            var _self = this;
            var $imgArr = $imgParent.find('img'); // 所有图片（闭包）

            // 每个小图点击事件（闭包）
            $imgArr.each( function( index, value ){
                $(this).click( function(){
                    _self.show( $(this), index, $imgArr );// 显示大图（插入html）
                });
            });
        },

        // 插入html元素
        appendHtml: function(){

            var _img = '';
            for( var i=0; i < this.imgSrcArr.length; i++ ){

                // rotateTemp 保存临时的 旋转角度；（保证前端视觉效果，避免 保存后再旋转，旋转方向反过来了）
                // rotateSave 保存 最终保存到数据库的 旋转角度（保存后改属性值清0）
                _img += '<div class="imgDiv"> <img src="' + this.imgSrcArr[i] + '" rotateTemp="0" rotateSave="0"> </div>';
            }

            var _content = '<div class="showBigImg">' +
                                '<div class="showBigImg_opBtn showBigImg_closeBtn"> <i class="fa fa-close" title="关闭"></i> </div>' +
                                '<div class="showBigImg_opBtn showBigImg_rotateLeftBtn"> <i class="fa fa-rotate-left" title="左转"></i> </div>' +
                                '<div class="showBigImg_opBtn showBigImg_rotateRightBtn"> <i class="fa fa-rotate-right" title="右转"></i> </div>' +
                                '<div class="showBigImg_opBtn showBigImg_saveBtn"> <i class="fa fa-save" title="保存"></i> </div>' +

                                '<div class="showBigImg_opBtn showBigImg_lastImgBtn"> <i class="fa fa-angle-left" title="上一张"></i> </div>' +
                                '<div class="showBigImg_opBtn showBigImg_nextImgBtn"> <i class="fa fa-angle-right" title="下一张"></i> </div>' +
                                '<div class="showBigImg_imgBox">' + _img + '</div>' +
                            '</div>';

            this.$showBigImg = $( _content );
            this.$showBigImg.css( 'opacity', '0' ).animate( { opacity: 1 }, 300 );// 动画（开始完全透明（不显示）增加透明度）
            $('body').append( this.$showBigImg );
        },

        // 设置元素的位置、样式，并显示 this.currentIndex 的图片
        setElementStyle: function(){

            var _self = this;

            // 上一张、下一张 按钮 高度
            _self.$showBigImg.find('.showBigImg_opBtn.showBigImg_lastImgBtn, .showBigImg_opBtn.showBigImg_nextImgBtn').each( function( index, value ){
                var _top = ( $(window).height() - $(this).height() ) / 2.2;
                $(this).css( 'top', _top + 'px' );
            });

            // 大图 的宽、高
            var _windowWidth = $(window).width();
            var _windowHeight = $(window).height();
            _self.$showBigImg.find('.showBigImg_imgBox').css({
                'width': _windowWidth * _self.imgSrcArr.length + 'px',
                'height': _windowHeight + 'px',
            });
            _self.$showBigImg.find('.showBigImg_imgBox > .imgDiv').css({
                'width': _windowWidth + 'px',
                'height': _windowHeight + 'px',
            });
            _self.$showBigImg.find('.showBigImg_imgBox > .imgDiv img').css({
                'max-width': _windowWidth * 0.8 + 'px',
                'max-height': _windowHeight * 0.8 + 'px',
            });

            // 显示 this.currentIndex 的图片
            _self.$showBigImg.find('.showBigImg_imgBox').css( 'left', -_windowWidth * _self.currentIndex + 'px' );
            _self.judgeIsHideBtnByCurrentIndex(); // 判断是否隐藏“上一张”“下一张”按钮

            // 不在css中设置动画效果，防止一打开大图的时候，有从右向左滑动的动画
            setTimeout( function(){

                _self.$showBigImg.find('.showBigImg_imgBox').css({
                    '-webkit-transition': 'all 0.5s',
                    '-moz-transition': 'all 0.5s',
                    '-ms-transition': 'all 0.5s',
                    '-o-transition': 'all 0.5s',
                    'transition': 'all 0.5s',
                });
            }, 0);
        },

        // 根据 this.currentIndex，判断是否隐藏“上一张”“下一张”按钮
        judgeIsHideBtnByCurrentIndex: function() {

            // 第一页，隐藏“上一张”按钮
            if( !this.currentIndex ) this.$showBigImg.find('.showBigImg_lastImgBtn').hide();
            else  this.$showBigImg.find('.showBigImg_lastImgBtn').show();

            // 最后一页，隐藏“下一张”按钮
            if( this.currentIndex == this.imgSrcArr.length - 1 ) this.$showBigImg.find('.showBigImg_nextImgBtn').hide();
            else this.$showBigImg.find('.showBigImg_nextImgBtn').show();
        },

        // 按钮事件
        addBtnEvent: function(){

            var _self = this;
            var _windowWidth = $(window).width();
            var $showBigImg_imgBox = this.$showBigImg.find('.showBigImg_imgBox'); // 承载所有图片的容器

            // 上一张
            this.$showBigImg.find('.showBigImg_lastImgBtn').off('click').on('click', function(){
                //console.log( _self.currentIndex );
                if( _self.currentIndex <= 0 ) return;// 第一张

                _self.currentIndex --;
                $showBigImg_imgBox.css( 'left', -_windowWidth * _self.currentIndex + 'px' );

                _self.judgeIsHideBtnByCurrentIndex(); // 判断是否隐藏“上一张”“下一张”按钮
            });

            // 下一张
            this.$showBigImg.find('.showBigImg_nextImgBtn').off('click').on('click', function(){
                //console.log( _self.currentIndex );
                if( _self.currentIndex >= _self.imgSrcArr.length-1 ) return;// 最后一张

                _self.currentIndex ++;
                $showBigImg_imgBox.css( 'left', - _windowWidth * _self.currentIndex + 'px' );

                _self.judgeIsHideBtnByCurrentIndex(); // 判断是否隐藏“上一张”“下一张”按钮
            });

            // 关闭
            this.$showBigImg.find('.showBigImg_closeBtn').off('click').on('click', function(){
                _self.close();// 关闭
            });


            // 保存
            this.$showBigImg.find('.showBigImg_saveBtn').off('click').on('click', function(){
                var $bigImg = _self.$showBigImg.find('.showBigImg_imgBox .imgDiv > img').eq( _self.currentIndex ); // 正在编辑的大图 img jq对象

                var _url = $bigImg.attr('src'); // 取整数
                var _rotateSave = parseInt( $bigImg.attr('rotateSave') ); // 取整数
                console.log( _url + '：' + _rotateSave );

                // 保存成功后：
                $bigImg.attr( 'rotateSave', 0 );
            });

            // 左转
            this.$showBigImg.find('.showBigImg_rotateLeftBtn').off('click').on('click', function(){
                rotateImg( -90 );
            });

            // 右转
            this.$showBigImg.find('.showBigImg_rotateRightBtn').off('click').on('click', function(){
                rotateImg( 90 );
            });

            // （辅助函数）参数：旋转角度（左-90，右90）
            function rotateImg( rotateDeg ){

                var $bigImg = _self.$showBigImg.find('.showBigImg_imgBox .imgDiv > img').eq( _self.currentIndex ); // 正在编辑的大图 img jq对象

                var _rotateTemp = parseInt( $bigImg.attr('rotateTemp') ) + rotateDeg; // 取整数，旋转后的属性值
                var _rotateSave = parseInt( $bigImg.attr('rotateSave') ) + rotateDeg; // 取整数，旋转后的属性值

                $bigImg.css( 'transform', 'rotate(' + _rotateTemp + 'deg)')
                    .attr( 'rotateTemp', _rotateTemp )
                    .attr( 'rotateSave', _rotateSave );
            }
        },

        // 打开大图（ $img被点击的小图的jq对象，index是被点击小图下标，$imgArr是所有图片的jq对象数组 ）
        show: function( $img, index, $imgArr ){

            //console.log( $img );
            var imgSrcArr = [];// 所有图片的 src

            // 遍历所有图片
            $imgArr.each( function( index, value ){
                imgSrcArr.push( value.src );
            });

            this.currentIndex = index; // 当前显示图片 的下标（ == 被点击的小图前面的图片数量）
            //console.log( this.currentIndex );

            // 初始化
            this.imgSrcArr = imgSrcArr;// 图片 src数组（每次点开大图，都会修改该属性）

            this.appendHtml(); // 插入html元素
            this.setElementStyle(); // 设置元素的位置、样式，并显示 this.currentIndex 的图片
            this.addBtnEvent(); // 按钮事件
        },

        // 关闭大图
        close: function(){
            var _self = this;

            // 动画（减少透明度）
            this.$showBigImg.animate({ opacity: 0 }, 300, function(){
                _self.$showBigImg.remove(); // 移除
                _self.$showBigImg = null;
            });
        },
    }
})( jQuery );
