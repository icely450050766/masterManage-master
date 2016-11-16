/**
 * Created by Administrator on 2016/10/5.
 */
var gatherStatistics = (function($){
    return{

        tableObj : null,
        otherElem : {},

        // 初始化
        init: function(){
            type = momo.getURLElement('type'); // 全局变量
            $('.newOne').attr( 'href', './lottery_new.html?type=' + type );// 新建按钮 携带type参数
            momo.initPage();// 左边菜单栏
            momo.download.call(this, "WaterPurifier/stasticsDownload");// 导出
            this.initTable();// 初始化表格
            this.initTotalTable();// 初始化表格
            this.addBtnEvent();// 给“搜索”“重置”按钮添加点击事件

            // 导出
            this.otherElem = { };
        },

        // 初始化表格
        initTable: function(){

            var _self = this;

            var url = 'WaterPurifier/orderStastics';
            var editUrl = '';
            var colName = ['序号','客户名称','应付金额','已付金额','已退金额'];
            var colModal = [
                { index: 'name', width:5, sort: false, formatter: setNum },
                { index: 'name', width:10, sort: false },
                { index: 'total', width:10, sort: false, formatter: setMoney0 },
                { index: 'is_paid', width:10, sort: false, formatter: setMoney1 },
                { index: 'no_paid', width:10, sort: false, formatter: setMoney2 },
            ];

            var data = {};
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, data, colName, colModal, undefined, false, true, editUrl );


            // （辅助函数）设置状态（上线/下线）
            function setNum( val, rowData, index ) {
                var _num = ( gatherStatistics.tableObj.currentPage - 1 ) *  gatherStatistics.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }

            // （辅助函数）设置金额符号（pay_status：应付为0，已付为1，待付为2）
            function setMoney0( val, rowData ){
                return showDetail( '￥' + val, rowData, 0 );
            }
            function setMoney1( val, rowData ){
                return showDetail( '￥' + val, rowData, 1 );
            }
            function setMoney2( val, rowData ){
                return showDetail( '￥' + val, rowData, 2 );
            }

            // （辅助函数）设置操作（this是 lottery对象）
            function showDetail( val, rowData, pay_status ){
                return '<a onclick="gatherStatistics.showDetail(\'' + rowData.name + '\',\'' + rowData.user_id + '\', ' + pay_status + ');">' + val + '</a>';
            }
        },

        // 初始化“总计”表格
        initTotalTable: function( keyword, startTime, endTime){

            var _self = this;
            var _data = {
                "page": _self.tableObj.data.page,
                "page_size": _self.tableObj.data.page_size,
                "keyword": keyword,
                "start": startTime,
                "end": endTime,
            };
            momo.sendPost( _data, 'WaterPurifier/orderStastics', function(data){
                //console.log( data );
                data = data.total;

                $('.total').text( '￥' + data.total );
                $('.is_paid').text( '￥' + data.is_paid );
                $('.no_paid').text( '￥' + data.no_paid );

            }, function(){
                alert('获取数据失败！');
            });
        },

        // 打开 详情模态框
        showDetail: function( name, user_id, pay_status ){

            var name = name;
            var user_id = user_id;
            var pay_status = pay_status;

            var term = $('#searchTime').val();// 时间范围

            var message = $('#detailModal').text();
            bootbox.dialog({
                size: 'large',
                title: "明细",
                message: message,
                onEscape: function () { }
            });

            // 设置iframe高度、src属性
            var _height = $(window).height() * 0.7;
            $('iframe#detailIFrame').css( 'height', _height + 'px')
                .attr( 'src', 'orderManager.html?isIFrame=1&name=' + name + '&term=' + term + '&user_id=' + user_id + '&pay_status=' + pay_status )
                .parents('.bootbox-body').css('overflow-y', 'visible');

            //console.log( $('iframe#detailIFrame').attr( 'src') );
        },

        // 给“搜索”“重置”按钮添加点击事件
        addBtnEvent: function(){

            // 点击搜索按钮
            $('.searchBtn').click( function(){

                var _searchInput = $('#searchInput').val();

                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';
                //console.log( _timeArr );

                var _data = {
                    "keyword": _searchInput,
                    "start": _startTime,
                    "end": _endTime,
                };

                this.tableObj.reloadData( _data, true );// jqGrid
                this.initTotalTable( _searchInput, _startTime, _endTime );// “总计”表格

                this.otherElem = $.extend( this.otherElem, _data);// 导出功能

            }.bind( this ));

            // 点击重置按钮
            $('.resetBtn').click( function() {

                // 输入框
                $('#searchInput').val('');
                $('#searchTime').val('');

                $('.searchBtn').trigger('click');// 查询

            });
        },

    }
})(jQuery);

var init = gatherStatistics.init.bind( gatherStatistics );
