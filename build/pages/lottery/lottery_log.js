/**
 * Created by Administrator on 2016/10/5.
 */
var lottery_log = (function($){
    return{

        tableObj : null,
        otherElem : {},
        //type : null,

        // 初始化
        init: function(){

            type = momo.getURLElement('type'); // 全局变量
            momo.initPage();// 左边菜单栏
            this.addBtnEvent();// 给“搜索”“重置”按钮添加点击事件
            momo.download.call(this, "Lottery/download");

            //动态接受参数进行设置（ 打开统计分析-》按活动统计-》选择某个活动查看明细 ）
            var isIFrame = momo.getURLElement("isIFrame");// 是否是模态框

            if( isIFrame ){ // 是模态框

                // iframe内部页面 移除 头部、左边菜单栏
                $('#header').remove();
                $('#sidebar').remove();
                $('.breadcrumbs').remove();
                $('.page-header').remove();
                $('.page-content').css( 'border', 'none' );

                // 初始化数据
                var analyzeID = momo.getURLElement("id");
                var analyzeName = momo.getURLElement("name");
                var analyzeTerm = momo.getURLElement("term");

                if ( analyzeID ) this.searchID = analyzeID;

                // 设置 搜索框
                $("#searchID").attr("type", "text").val( analyzeID ).attr('readonly', 'true');
                $('#searchTime').val( analyzeTerm ).attr('disabled', 'disabled');
                $("#searchName").val( analyzeName ).attr('readonly', 'true');

                // 根据搜索条件初始化表格数据
                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';

                var _data = {};
                _data = {
                    "start": _startTime,
                    "end": _endTime,
                    "name": $('#searchName').val(),
                    "lottery_id": $('#searchID').val(),
                };

                this.initTable( _data );// 初始化表格

            }else{ // 不是模态框
                this.initTable();// 初始化表格
            }

            // 导出
            this.otherElem = {
                page: lottery_log.tableObj.data.page,
                type: type,
            };

        },

        // 初始化表格（当页面是在iframe中加载时，传入data参数。不读入两次数据（全部、筛选后的数据）。防止因异步加载返回数据先后不可控，导致呈现数据出错）
        initTable: function( data ){

            var _self = this;

            var url = '/Lottery/log';
            var editUrl = 'Lottery/changestatus?status=0';
            var colName = ['序号','流水号','活动编码','名称','参与者ID','参与者','获奖情况','所获电子券总额','参与时间'];
            var colModal = [
                { index: 'id', width:10, sort: false, formatter: setNum },
                { index: 'id', width:20, sort: false },
                { index: 'lottery_id', width:20, sort: false },
                { index: 'name', width:20, sort: false, },
                { index: 'user_id', width:20, sort: false, },
                { index: 'user_name', width:20, sort: false, },
                { index: 'prize_name', width:20, sort: false },
                { index: 'prize_amount', width:20, sort: false },
                { index: 'add_time', width:40, sort: false },
            ];

            var _data = { "type": type };
            if( data != undefined )  _data = $.extend( _data, data );
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, _data, colName, colModal, undefined, false, true, editUrl );

            // （辅助函数）设置状态（上线/下线）
            function setNum( val, rowData, index ) {
                var _num = ( lottery_log.tableObj.currentPage - 1 ) *  lottery_log.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }
        },

        // 给“搜索”“重置”按钮添加点击事件
        addBtnEvent: function(){

            // 点击搜索按钮
            $('.searchBtn').click( function(){

                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';
                //console.log( _timeArr );

                var _searchName = $('#searchName').val();
                var _searchID = $('#searchID').val();
                var _searchIDText = $('#searchIDText').val();
                var _searchUserName = $('#searchUserName').val();
                var _searchUserID = $('#searchUserID').val();

                var _name = $('#searchName').val();
                var _admin_user = $('#searchAuthor').val();
                var _data = {
                    "start": _startTime,
                    "end": _endTime,
                    "name": _searchName,
                    "lottery_id": _searchID,
                    "rec_id": _searchIDText,
                    "user_name": _searchUserName,
                    "user_id": _searchUserID,
                };
                this.tableObj.reloadData( _data, true );

                this.otherElem = $.extend( this.otherElem, _data);// 导出功能

            }.bind( this ));

            // 点击重置按钮
            $('.resetBtn ').click( function(){

                var isIFrame = momo.getURLElement("isIFrame");// 是否是模态框

                if( !isIFrame ){
                    $('#searchTime').val('');
                    $('#searchID').val('');
                    $('#searchName').val('');
                }
                $('#searchIDText').val('');
                $('#searchUserName').val('');
                $('#searchUserID').val('');

                $('.searchBtn').trigger('click');// 查询
            });
        },

    }
})(jQuery);

var init = lottery_log.init.bind( lottery_log );