/**
 * Created by Administrator on 2016/10/5.
 */
var lottery = (function($){
    return{

        tableObj : null,
        //type : null,

        // 初始化
        init: function(){
            type = momo.getURLElement('type'); // 全局变量
            $('.newOne').attr( 'href', './lottery_new.html?type=' + type );// 新建按钮 携带type参数
            momo.initPage();// 左边菜单栏
            this.initTable();// 初始化表格
            this.addBtnEvent();// 给“搜索”“重置”按钮添加点击事件
        },

        // 初始化表格
        initTable: function(){

            var _self = this;

            var url = '/Lottery/index';
            var editUrl = 'Lottery/changestatus?status=0';
            var colName = ['序号','活动编码','名称','有效期','状态','奖池情况','创建时间','创建人','备注','操作'];
            var colModal = [
                { index: 'id', width:10, sort: false, formatter: setNum },
                { index: 'id', width:10, sort: false },
                { index: 'name', width:20, sort: false },
                { index: 'start_time', width:30, sort: false, formatter: setTerm },
                { index: 'status', width:15, sort: false, formatter: setStatus },
                { index: 'amount', width:20, sort: false },
                { index: 'add_time', width:20, sort: false },
                { index: 'admin_id', width:15, sort: false },
                { index: 'remark', width:15, sort: false },
                { index: 'id', width:30, sort: false, formatter: setOperate.bind(_self) },// 传入id，操作表单
            ];

            var data = {
                "type": type,
                "status": "-1",
            };
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, data, colName, colModal, undefined, false, true, editUrl );


            // （辅助函数）设置状态（上线/下线）
            function setNum( val, rowData, index ) {
                var _num = ( lottery.tableObj.currentPage - 1 ) *  lottery.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }

            // （辅助函数）设置状态（上线/下线）
            function setStatus( val ) {
                return val == 1 ? '上线' : '下线';
            }

            // （辅助函数）设置 有效期
            function setTerm( val, rowData ){
                return '<span>起：' + rowData.start_time + '<br/>止：' + rowData.end_time + '</span>';
            }

            // （辅助函数）设置操作（this是 lottery对象）
            function setOperate( val, rowData ){

                var _self = this;
//                    console.log( _self );

                var _temp = '';
                if( parseInt( rowData.status ) ){
                    // onclick 作用域是 window
                    _temp = '<a class="updateItem btn btn-mini btn-danger tableInnerBtn" onclick="lottery.changeStatus(' + val + ', 0, \'' + rowData.end_time + '\' );">下线</a>';
                }else{
                    _temp = '<a class="updateItem btn btn-mini btn-danger tableInnerBtn" onclick="lottery.changeStatus(' + val + ', 1, \'' + rowData.end_time + '\' );">上线</a>';
                }

                return '<a class="updateItem btn btn-mini btn-primary tableInnerBtn" href="./lottery_new.html?type=' + type + '&id=' + val + '">编辑</a>' +
                    '<a class="updateItem btn btn-mini btn-primary tableInnerBtn" onclick="lottery.showDetail(\'' + val + '\', \'' + rowData.name + '\');">明细</a>' +
                    _temp;

            }
        },

        // 修改状态（1上线）
        changeStatus: function( id, status, endTime ) {

            endTime = endTime.replace('年', '-').replace('月', '-').replace('日', '-');

            // 到期并下线的活动，再上线时需弹出提醒
            if( status ){

                var today = new Date();
                var endTime = new Date( endTime.replace(/\-/g, "\/") );

                if( today > endTime ){
                    alert("该活动已到期并下线，无法上线！");
                    return;
                }
            }

            // 提交数据
            var _data = { "id": id, "status": status.toString() };
            momo.sendPost(_data, 'Lottery/changestatus', function (data) {
                if (data.errmsg == "ok") {
                    this.tableObj.reloadData();
                }else{
                    alert(data.errmsg);
                }
            }.bind( this ));
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
                }
            );

            // 设置iframe高度、src属性
            var _height = $(window).height() * 0.7;
            $('iframe#detailIFrame').css( 'height', _height + 'px')
                .attr( 'src', 'lottery_log.html?isIFrame=1&type=' + type + '&id=' + id + '&name=' + name + '&term=' + term );

        },

        // 给“搜索”“重置”按钮添加点击事件
        addBtnEvent: function(){

            // 点击搜索按钮
            $('.searchBtn').click( function(){

                var _status = $('#searchStatus').val();

                var _timeArr = $('#searchTime').val().split(' - ');
                var _startTime = _timeArr[0] ? _timeArr[0] : '';
                var _endTime = _timeArr[1] ? _timeArr[1] : '';
                //console.log( _timeArr );

                var _name = $('#searchName').val();
                var _admin_user = $('#searchAuthor').val();
                var _data = {
                    "status": _status,
                    "start": _startTime,
                    "end": _endTime,
                    "name": _name,
                    "admin_user": _admin_user,
                };
                this.tableObj.reloadData( _data, true );

            }.bind( this ));

            // 点击重置按钮
            $('.resetBtn ').click( function(){

                $('#searchStatus').val(-1);
                $('#searchTime').val('');
                $('#searchName').val('');
                $('#searchAuthor').val('');

                $('.searchBtn').trigger('click');// 查询
            });
        },

    }
})(jQuery);

var init = lottery.init.bind( lottery );