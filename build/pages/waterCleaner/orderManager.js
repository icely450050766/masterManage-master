/**
 * Created by Administrator on 2016/10/5.
 */
var orderManager = (function($){
    return{

        tableObj : null,
        otherElem : {},
        watchingOrderId : null,// 正查看的 订单id（打开了 订单详情模态框）
        deleteOrderImg: null,// 取消订单 上传图片凭证
        voucher: null,// 已取消的订单，查看模态框 数据

        // 初始化
        init: function(){
            type = momo.getURLElement('type'); // 全局变量
            momo.initPage();// 左边菜单栏
            momo.download.call(this, "WaterPurifier/download");// 导出
            this.addBtnEvent();// 给“搜索”“重置”按钮添加点击事件

            //动态接受参数进行设置
            var isIFrame = momo.getURLElement("isIFrame");// 是否是模态框
            //console.log( isIFrame );

            if( isIFrame ) { // 是模态框

                // iframe内部页面 移除 头部、左边菜单栏
                $('#header').remove();
                $('#sidebar').remove();
                $('.breadcrumbs').remove();
                $('.page-header').remove();
                $('.page-content').css('border', 'none');

                name = momo.getURLElement("name");
                user_id = momo.getURLElement("user_id");
                pay_status = momo.getURLElement("pay_status");
                term = momo.getURLElement("term");

                $('#searchInput').val( name ).attr( 'readonly', 'true' ); // 设置搜索框
                $('#searchTime').val( term ).attr( 'disabled', 'disabled' ); // 设置搜索框

                // 根据搜索条件初始化表格数据
                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';

                var _data = {
                    "keyword": name,
                    "user_id": user_id,
                    "pay_status": pay_status,
                    "start": _startTime,
                    "end": _endTime,
                };
                console.log( _data );
                this.initTable( _data, true );// 初始化表格

            }else{
                this.initTable( {}, false );// 初始化表格
            }

            // 导出
            this.otherElem = { };
        },

        // 初始化表格
        initTable: function( data, isIFrame ){

            var _self = this;

            var url = 'WaterPurifier/orderList';
            var editUrl = '';
            var colName = ['序号','单号/下单时间','客户名称','地址','订单类型','金额','状态','付款状态','服务完成时间','操作'];
            var colModal = [
                { index: 'order_id', width:10, textOverflowEllipsis: true, sort: false, formatter: setNum },
                { index: 'add_time', width:30, textOverflowEllipsis: false, sort: false, formatter: setOrderNumAndAddTime },
                { index: 'shipping_name', width:15, textOverflowEllipsis: true, sort: false },
                { index: 'shipping_addr', width:30, textOverflowEllipsis: true, sort: false },
                { index: 'order_type', width:10, textOverflowEllipsis: true, sort: false },
                { index: 'actually_total', width:10, textOverflowEllipsis: true, sort: false },
                { index: 'status', width:15, textOverflowEllipsis: true, sort: false },
                { index: 'payment_text', width:15, textOverflowEllipsis: true, sort: false },
                { index: 'finish_time', width:25, textOverflowEllipsis: true, sort: false },
                { index: 'order_id', width:30, textOverflowEllipsis: true, sort: false, formatter: setOperate.bind(_self) },// 传入id，操作表单
            ];

            // 如果是iframe，不显示“操作”
            if( isIFrame ){
                colName.pop();
                colModal.pop();
            }

            var _data = {};
            if( data != undefined ) _data = $.extend( _data, data );
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, _data, colName, colModal, undefined, false, true, editUrl );


            // （辅助函数）设置序号
            function setNum( val, rowData, index ) {
                var _num = ( orderManager.tableObj.currentPage - 1 ) *  orderManager.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }

            // （辅助函数）设置 单号/下单时间
            function setOrderNumAndAddTime( val, rowData ){
                return '<span>' + rowData.order_num + ' / ' + rowData.add_time + '</span>';
            }

            // （辅助函数）设置操作（this是 lottery对象）
            function setOperate( val, rowData ){

                var _str =  '<a class="updateItem btn btn-mini btn-primary tableInnerBtn" onclick="orderManager.showDetail(\'' + val + '\');">订单详情</a>';

                if( rowData.payment_code == 3  &&  rowData.payment_status == 0 ){ // 显示按钮 （不是线下收款、且未付款）
                    _str += '<a class="updateItem btn btn-mini btn-primary tableInnerBtn" onclick="orderManager.confirmLineReceipt.call( this, \'' + val + '\');">线下收款</a>';
                }

                //if( momo.getURLElement("isIFrame") ) return '';// 是模态框，不允许操作

                return _str;
            }
        },

        // 线下收款 确认 ( this 是 线下收款按钮 )
        confirmLineReceipt: function( order_id ){

            if( confirm('你确定要执行此操作吗？') ){
                momo.sendPost( { "order_id": order_id }, 'WaterPurifier/offlinePay', function( data ){
                    if ( data.errcode == 0 ) {
                        momo.showTip('操作成功！');
                        $(this).remove();// 移除 线下收款按钮
                    }
                }.bind( this ), function(){});
            }

            //bootbox.confirm({
            //    title: '线下收款',
            //    message: '<p>你确定要执行此操作吗？</p>',
            //    buttons: {
            //        confirm: {
            //            label: '确认',
            //            className: 'btn btn-sm btn-primary width80'
            //        },
            //        cancel: {
            //            label: '取消',
            //            className: 'btn btn-sm btn-inverse width80'
            //        }
            //    },
            //    callback: function(result) {
            //        if(result) { // 确认
            //            console.log('a');
            //        }
            //    },
            //});
        },

        // 点击 订单详情按钮，弹出模态框
        showDetail: function( order_id ) {

            this.watchingOrderId = order_id;
            var _self = this;

            var message = $('#detailModal').text();
            bootbox.dialog({
                size: 'large',
                title: "订单详情",
                message: message,
                onEscape: function () {
                    this.watchingOrderId = null;
                }
            });

            $('.remarkCancel').trigger('click'); // 订单备注 显示 编辑按钮
            $('#logToggleBtnId').trigger('click');// 默认 收起日志

            // 获取数据，初始化模态框数据
            momo.sendPost( {"order_id": order_id }, 'WaterPurifier/orderDetail', function(data){
                data = data.data;

                // 顶部 订单信息
                $('.order_num').text( data.order_num );// 订单号
                $('.service_status').text( data.service_status_text );// 服务状态

                // 取消订单 按钮 是否显示
                if( data.service_status != '0' ) $('.openDeleteOrderModalBtn').hide(); // 状态：0服务中，1完成服务，2已取消
                else $('.openDeleteOrderModalBtn').show();

                // 付款信息、金额信息
                $('.payment_code').text( data.payment_code );
                $('.payment_type').text( data.payment_type );
                $('.payment_status').text( data.payment_status );
                $('.payment_type').text( data.payment_type );
                $('.total').text( '￥' + data.total );
                $('.reduce').text( '-￥' + data.reduce );
                $('.actually_total').text( '￥' + data.actually_total );

                // 人物信息
                $('.shipping_name').text( data.shipping_name );
                $('.shipping_tel').text( data.shipping_tel );
                $('.shipping_addr').text( data.shipping_addr );
                $('.add_time').text( data.add_time );
                $('.remark').text( data.remark ).val( data.remark );

                // 表格数据
                setOrderData( data.detail );// 设置 订单内容 数据
                setLogData( data.log );// 设置 日志 数据

                // 已取消的订单，查看模态框 数据
                _self.voucher = data.voucher;

            }, function(){
                alert('获取订单详情数据失败！');
            });

            // （辅助函数）设置 订单内容 数据
            function setOrderData( data ){
                var _content = '';
                for( var i=0; i < data.length; i++ ){
                    _content += '<tr>' +
                                    '<td>' + (i+1) + '</td>' +
                                    '<td>' + data[i].item_name + '</td>' +
                                    '<td>' + data[i].num + '</td>' +
                                    '<td>￥' + data[i].price + '</td>' +
                                    '<td>￥' + data[i].price * data[i].num + '</td>' +
                                '</tr>';
                }
                $('#orderTbody').html( _content );
            }

            // （辅助函数）设置 日志 数据
            function setLogData( data ){
                var _content = '';
                for( var i=0; i < data.length; i++ ){
                    _content += '<tr>' +
                                    '<td>' + data[i].time + '</td>' +
                                    '<td>' + data[i].type + '</td>' +
                                    '<td>' + data[i].content +
                                    ( data[i].is_cancel ? '<button class="btn btn-xs btn-primary tableInnerBtn showDeleteOrderInfoBtn" style="margin-left: 20px;">查看</button>' : '' ) +
                                    '</td>' +
                                '</tr>';
                }
                $('#logTbody').html( _content );
            }

        },

        // 给“搜索”“重置”按钮、“展开/收起日志”、“取消订单”按钮、订单备注编辑、保存、取消按钮 添加点击事件
        addBtnEvent: function(){

            var _self = this;

            // 点击搜索按钮
            $('.searchBtn').click( function(){

                var _searchInput = $('#searchInput').val();
                var _searchType = $('#searchType').val();
                var _searchDay = $('#searchDay').val();
                var _searchProvince = $('#searchProvince').val();
                var _searchCity = $('#searchCity').val();

                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';
                //console.log( _timeArr );

                var _data = {
                    "keyword": _searchInput,
                    "start": _startTime,
                    "end": _endTime,
                    "order_type": _searchType,
                    "day": _searchDay,
                    "province": _searchProvince,
                    "city": _searchCity,
                };
                this.tableObj.reloadData( _data, true );

                this.otherElem = $.extend( this.otherElem, _data);// 导出功能

            }.bind( this ));

            // 点击重置按钮
            $('.resetBtn ').click( function(){

                var isIFrame = momo.getURLElement("isIFrame");// 是否是模态框

                // 输入框
                if( !isIFrame ){
                    $('#searchInput').val('');
                    $('#searchTime').val('');
                }
                $('#searchDay').val('');

                // 下拉列表
                $('#searchType').val('0');// 订单类型
                $('#searchProvince').val('');
                $('#searchCity').val('').find("option[value!='']").remove();// 清空“城市”下拉

                $('.searchBtn').trigger('click');// 查询
            });

            // 点击 展开/收起日志按钮
            $(document).on( 'click', '#logToggleBtnId', function(){
                var _self = this;
                $('#logTableId').slideToggle( 300, function(){

                    if( $(this).is(':visible') ){
                        $(_self).text('收起日志');

                        // 上滚
                        scrollToTop( $('#logToggleBtnId') ); // 让 展开/收起日志按钮 上滚到顶部
                    }
                    else $(_self).text('展开日志');
                });

                // 让 $item 上滚到顶部
                function scrollToTop( $item ){

                    console.log( $item.offset().top );
                    var $scrollDiv = $item.parents('.bootbox-body');// 模态框

                    // 滚动条 未到最底部
                    if( $scrollDiv.scrollTop() + $scrollDiv[0].clientHeight < $scrollDiv[0].scrollHeight ){

                        $scrollDiv.animate({ 'scrollTop': '+=10px' }, 10, function() {
                            if( $item.offset().top > 15 ) scrollToTop( $item );// $item 未到最顶部，继续上滚
                        });
                    }
                }
            });


            // 点击 已取消的订单 查看按钮，弹出模态框显示订单信息
            $(document).on('click', '.showDeleteOrderInfoBtn', function(){

                console.log( _self.voucher );
                if( _self.voucher ){

                    // 打开模态框
                    var message = $('#deleteOrderModal').text();
                    bootbox.dialog({
                        //size: 'large',
                        title: "取消订单",
                        message: message,
                        onEscape: function () { }
                    });

                    $('.deleteOrder').remove();// “取消订单”按钮 移除
                    $('.deleteOrderModalContent > div.row:first-child').remove();

                    // 填充数据
                    $('.deleteOrder_total').prop( 'disabled', true ).val( _self.voucher.amount );// 转账金额
                    $('.deleteOrder_pay_time').prop( 'disabled', true ).attr('type', 'text').val( _self.voucher.pay_time );// 付款日期
                    $('.deleteOrder_remark').prop( 'disabled', true ).val( _self.voucher.remark );// 备注

                    // 图片（显示大图）
                    var _content = '<div class="showBigImgDiv">';
                    if( _self.voucher.voucher ){ // 有图片（没图片时该值为null）
                        for( var i=0; i <  _self.voucher.voucher.length; i++ ){
                            _content += '<img class="smallPic" src="' + _self.voucher.voucher[i] +  '">';
                        }
                    }
                    _content += '</div>';
                    $('#deleteOrderImg').html( _content );

                    showBigImg.init( $('.showBigImgDiv') );// 查看大图 初始化
                }
            });

            // 点击 取消订单按钮，打开取消订单模态框
            $(document).on('click', '.openDeleteOrderModalBtn', function(){

                // 打开模态框
                var message = $('#deleteOrderModal').text();
                bootbox.dialog({
                    //size: 'large',
                    title: "取消订单",
                    message: message,
                    onEscape: function () {
                    }
                });

                _self.deleteOrderImg = new upLoadImg( $('#deleteOrderImg'), 4 ); // 插入 添加图片 按钮
                $('.deleteOrder_total').val( $('.total').text() );// 转账金额

            });

            //点击 取消订单按钮，取消订单
            $(document).on('click', '.deleteOrder', function(){
                if( confirm('确认取消订单？') ){

                    _self.deleteOrderImg.upLoadAll();// 上传图片

                    // 监听图片上传完成事件
                    _self.deleteOrderImg.$upLoadBtn.one( 'upLoadFinish', function(e){

                        // 图片
                        var _resultArr = _self.deleteOrderImg.imgUploadInfoArr;
                        //console.log( _resultArr );

                        var _arr = [];
                        for( var i=0; i < _resultArr.length; i++ ) _arr.push( _resultArr[i].url );


                        // 提交后台
                        var _data = {
                            "order_id": _self.watchingOrderId,
                            "pay_time": $('.deleteOrder_pay_time').val(),
                            "remark": $('.deleteOrder_remark').val(),
                            "voucher": _arr,
                        };
                        momo.sendPost( _data, 'WaterPurifier/orderCancel', function( data ){

                            if( !data.errcode ){

                                alert('取消订单成功！');
                                _self.watchingOrderId = null;
                                bootbox.hideAll();// 关闭模态框

                                _self.tableObj.reloadData();// 刷新表格数据
                            }
                            else alert( data.errmsg );

                        }, function(){
                            alert('取消订单失败！');
                        });

                    });

                }
            });


            // 点击 订单备注编辑按钮
            $(document).on('click', '.remarkEdit', function(){
                $('.remarkEdit').hide();
                $('.remarkSave').show();
                $('.remarkCancel').show();

                $('input.remark').show().focus().select();
                $('span.remark').hide();
            });

            // 点击 订单备注保存按钮
            $(document).on('click', '.remarkSave', function(){

                var _data = {
                    "order_id": _self.watchingOrderId,
                    "remark": $('input.remark').val(),
                };
                momo.sendPost( _data, 'WaterPurifier/remark', function(data){

                    $('.remark').text( _data.remark ).val( _data.remark );
                    $('.remarkCancel').trigger('click');// 点击取消按钮

                    momo.showTip('保存成功');// 提示内容

                },function(){
                    alert('订单备注修改失败！');
                });

            });

            // 点击 订单备注取消按钮
            $(document).on('click', '.remarkCancel', function(){
                $('.remarkEdit').show();
                $('.remarkSave').hide();
                $('.remarkCancel').hide();

                $('input.remark').hide();
                $('span.remark').show();
            });

        },
    }
})(jQuery);

var init = orderManager.init.bind( orderManager );
