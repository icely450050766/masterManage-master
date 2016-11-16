/**
 * Created by Administrator on 2016/10/5.
 */
var lottery_analyze = (function($){
    return{

        tableObj : null,
        //type : null,

        // 初始化
        init: function(){
            type = momo.getURLElement('type'); // 全局变量
            momo.initPage();// 左边菜单栏
            this.initTable();// 初始化表格
            this.addBtnEvent();// 给“搜索”“重置”按钮添加点击事件
            $('.searchBtn').trigger('click');// 模拟点击，初始化内容
        },

        // 初始化表格
        initTable: function(){
            var url = '/Lottery/stastics';
            var editUrl = '';
            var colName = ['序号','活动编码','活动名称','参与次数','金额','操作'];
            var colModal = [
                { index: 'id', width:20, sort: false, formatter: setNum },
                { index: 'id', width:20, sort: false },
                { index: 'name', width:20, sort: false },
                { index: 'count', width:30, sort: false},
                { index: 'amount', width:20, sort: false },
                { index: 'id', width:25, sort: false, formatter: setOperate },// 传入id，操作表单
            ];

            var data = {
                "type": type,
                "group": 1,
            };
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, data, colName, colModal, undefined, false, true, editUrl );

            // （辅助函数）设置状态（上线/下线）
            function setNum( val, rowData, index ) {
                var _num = ( lottery_analyze.tableObj.currentPage - 1 ) *  lottery_analyze.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }

            // （辅助函数）设置操作
            function setOperate( val, rowData ){
                //return '<a class="updateItem btn btn-mini btn-primary" href="./lottery_log.html?type=' + type + '&id=' + val + '&name=' + rowData.name + '">明细</a>';
                return '<a class="updateItem btn btn-mini btn-primary tableInnerBtn" onclick="lottery_analyze.showDetail(\'' + val + '\', \'' + rowData.name + '\');">明细</a>';
            }
        },

        // 点击明细按钮，弹出模态框
        showDetail: function( id, name ){
            //console.log( id );
            //console.log( name );
            var term = $('#searchTime').val();// 时间范围

            var message = $('#detailModal').text();
            bootbox.dialog({
                size: 'large',
                title: "明细",
                message: message,
                onEscape: function () {
                    console.log("onEscape");
                }
            });

            // 设置iframe高度、src属性
            var _height = $(window).height() * 0.7;
            $('iframe#detailIFrame').css( 'height', _height + 'px')
                .attr( 'src', 'lottery_log.html?isIFrame=1&type=' + type + '&id=' + id + '&name=' + name + '&term=' + term )
                .parents('.bootbox-body').css('overflow-y', 'visible');

        },

        // 给“搜索”“重置”按钮添加点击事件
        addBtnEvent: function(){

            var _self = this;

            // 点击搜索按钮
            $('.searchBtn').click( function(){

                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';
                //console.log( _timeArr );

                var _name = $('#searchName').val();
                var _lottery_id = $('#searchIDText').val();

                // 请求数据
                var _data = {
                    "start": _startTime,
                    "end": _endTime,
                    "name": _name,
                    "lottery_id": _lottery_id,
                };

                var _type = parseInt( $('#searchType').val() );// 下拉列表类型

                // 根据下拉列表，决定显示哪个表格
                if( _type ){

                    $('.tab1').hide();
                    $('#jqGrid').show();
                    this.tableObj.reloadData( _data, true );// 重新载入表格 的数据

                }else{

                    $('.tab1').show();
                    $('#jqGrid').hide();

                    // 请求数据
                    var url = './Lottery/stastics';
                    _data = $.extend( _data, {"type": type, "group": 0, } );
                    momo.sendPost( _data, url, function( data ){
                        $(".tab1 .joinNum").text(data.data.count);
                        $(".tab1 .sumMoney").text(data.data.amount);

                        // 点击“明细”跳转
                        //$('.tab1 .logHref').attr('href', 'lottery_log.html?type=' + type);
                    });
                }

            }.bind( this ));

            // 点击重置按钮
            $('.resetBtn').click( function(){

                $('#searchTime').val('');
                $('#searchName').val('');
                $('#searchIDText').val('');

                $('.searchBtn').trigger('click');// 查询
            });

            // 点击明细
            $(document).on('click', '.tab1 .logHref', function(){

                var _name = $('#searchName').val();
                var _lottery_id = $('#searchIDText').val();

                _self.showDetail( _lottery_id, _name );
            });
        },

    }
})(jQuery);

var init = lottery_analyze.init.bind( lottery_analyze );