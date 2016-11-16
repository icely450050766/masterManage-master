/**
 * Created by Administrator on 2016/10/5.
 */
var incomeAndExpenses = (function($){
    return{

        tableObj : null,
        otherElem : {},

        // 初始化
        init: function(){
            type = momo.getURLElement('type'); // 全局变量
            momo.initPage();// 左边菜单栏
            momo.download.call(this, "WaterPurifier/incomeDownload");// 导出
            this.initTable();// 初始化表格
            this.addBtnEvent();// 给“搜索”“重置”按钮添加点击事件

            // 导出
            this.otherElem = { };
        },

        // 初始化表格
        initTable: function(){

            var _self = this;

            var url = 'WaterPurifier/incomeDetail';
            var editUrl = '';
            var colName = ['序号','流水号','时间','用户名称','类型','渠道','金额'];
            var colModal = [
                { index: 'id', width:10, sort: false, textOverflowEllipsis: true, formatter: setNum },
                { index: 'order_id', width:25, sort: false, textOverflowEllipsis: true, },
                { index: 'addtime', width:20, sort: false, textOverflowEllipsis: true, },
                { index: 'user_name', width:20, sort: false, textOverflowEllipsis: true, },
                { index: 'type', width:15, sort: false, textOverflowEllipsis: true, },
                { index: 'channel', width:15, sort: false, textOverflowEllipsis: true, },
                { index: 'amount', width:15, sort: false, textOverflowEllipsis: true, },
            ];

            var data = { };
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, data, colName, colModal, undefined, false, true, editUrl );


            // （辅助函数）设置状态（上线/下线）
            function setNum( val, rowData, index ) {
                var _num = ( incomeAndExpenses.tableObj.currentPage - 1 ) *  incomeAndExpenses.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }

            // （辅助函数）设置操作（this是 lottery对象）
            function setOperate( val, rowData ){
                return '<a class="updateItem btn btn-mini btn-primary" onclick="incomeAndExpenses.openAndInitModal();">详情</a>';
            }
        },

        // 给“搜索”“重置”按钮添加点击事件
        addBtnEvent: function(){

            // 点击搜索按钮
            $('.searchBtn').click( function(){

                var _searchInput = $('#searchInput').val();
                var _searchPayWay = $('#searchPayWay').val();

                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';
                //console.log( _timeArr );

                var _data = {
                    "keyword": _searchInput,
                    "type": _searchPayWay,
                    "start": _startTime,
                    "end": _endTime,
                };
                this.tableObj.reloadData( _data, true );

                this.otherElem = $.extend( this.otherElem, _data);// 导出功能

            }.bind( this ));

            // 点击重置按钮
            $('.resetBtn').click( function() {

                // 输入框
                $('#searchInput').val('');
                $('#searchTime').val('');

                // 下拉列表
                $('#searchPayWay').val('0');

                $('.searchBtn').trigger('click');// 查询
            });
        },

    }
})(jQuery);

var init = incomeAndExpenses.init.bind( incomeAndExpenses );
