//话题详情
var lotteryNew = (function () {
    return {
        lottery_id: "",//若当前是修改话题信息，则保持话题ID
        pageIndex: 1,//标示当前页面数
        status: -1,
        type: "1",//1业主端，2师傅端
        _bootbox: {},//遮罩弹窗的句柄
        selectItem: {},//选择电子券的按钮
        ticketList: [],
        ticketHtml: "",//保存初始态的页面信息
        searchTicketID: "",//搜索的显示类型
        searchTicketName: "",//搜索的内容
        dayNum: 1,//持续天数
        timeNum: 1,//每天场次
        daySum: 0,//单日支出金额
        startTime: "",//起始时间

        //初始化函数
        init: function () {
            var self = this;
            //重置赛选条件
            function reset(onlyReset) {//重置查询条件
                self.searchTicketID = "";
                self.searchTicketName = "";
                $("#searchTicketID").val("");
                $("#searchTicketName").val("");
                if (onlyReset)return;
                //self.getList();
            }

            momo.initPage();
            momo.addPageEvent(self);
            $(document).on("click", ".searchBtn", self.search.bind(self));
            $(document).on("click", ".resetBtn", reset);
            self.ticketHtml = $("#ticket").html();
            $("#ticket").remove();
            $(".headerURl").attr("href", "./lottery.html?type=" + momo.getURLElement("type"));
            //$(".routing").attr("data-route", "./lottery.html?type=" + momo.getURLElement("type"));
            $(".routing").attr("data-route", "lottery.html?type=" + momo.getURLElement("type"));// icely change

            //设置是否是师傅端
            if (momo.getURLElement("type") == "2") {
                this.type = 2;
                this.timeNum = 3;
                $(".type2").show();
                $(".timeNum").text("3");
                //修改电子券列表
                $(".ticketTitle").text("金额(元)");
                $(".ticketName").html("<input type='number' class='ticketValue'/>");
            }

            // icely add（输入限制）
            momo.inputText('.name', 20);
            momo.inputText('.remark', 150);
            momo.inputText('.lotteryName', 5);
            momo.inputText('.ticketName input', 8);
            momo.inputText('.lotteryNum', 8);

            $('.ticketName input').attr('min', '0').attr( 'max', '99999999').css('width', '90%');
            $('.lotteryNum').attr('min', '0').attr( 'max', '99999999').css('width', '90%');

            // 监听显示 得到焦点时，可能修改内容，全选内容
            $('.lotteryName').focus(function( event ){
                event.target.select();
            });

            // 监听库存 失去焦点时，值是否为非负整数（负数？小数？）
            $('.lotteryNum').change( function(){
                if( parseInt( $(this).val() ) < 0  ||  parseInt( $(this).val() ) != $(this).val() ){
                    alert('库存只能输入0和正整数！');
                    $(this).focus().select();
                }
            });

            //点击发布
            $(document).on("click", ".submitBtn", this.addItem.bind(this));

            //取消新建
            $(document).on("click", ".cancelBtn2", function () {location.href = "./lottery.html?type=" + momo.getURLElement("type");});

            //打开电子券列表
            $(document).on("click", ".showTicket", function () {
                if (momo.getURLElement("id")) {//修改时

                    var id = $(this).parent("td").attr("data-id");
                    var item = {};
                    var template = $("#ticketDetailItem").text();

                    for (var i = 0, length = self.ticketList.length; i < length; i++) {
                        if (id == self.ticketList[i].volume_id) {
                            item = self.ticketList[i];
                            break;
                        }
                    }
                    var status = "已生效";
                    var condition = "订单满" + item.min + "时可用";
                    if (item.status == 0)status = "未生效";
                    if (item.min == 0)condition = "任意可用";
                    var message = momo.template(template, {
                        name: item.volume_name,
                        value: item.amount,
                        type: item.type,
                        range: item.category,
                        condition: condition,
                        start_at: item.start_time,
                        end_at: item.end_time,
                        status: status
                    });

                    bootbox.dialog({
                            title: "电子券详情",
                            message: message,
                            onEscape: function () {
                                console.log("onEscape");
                                reset();
                            }
                        }
                    );

                }
                else {//新建时

                    self.selectItem = $(this);
                    //window.setTimeout(function () {self.getList();}, 0);

                    self._bootbox = bootbox.dialog({
                        size: "large",
                        title: "选择电子券",
                        message: self.ticketHtml,
                        buttons: {
                                success: {
                                    label: "Save",
                                    className: "btn-success2",
                                    callback: function () {}
                                }
                            },
                            onEscape: function () {
                                console.log("onEscape");
                                reset();
                            },
                            callback: function () {
                                console.log("over");
                                self.tableObj.remove();
                            }
                        }
                    );

                    self.initTable();// 初始化表格数据

                    console.log(self._bootbox);
                    $(".btn-success2").hide();
                }
            });

            //新建时选择电子券
            $(document).on("click", ".selectTicketBtn", function () {
                self._bootbox.modal('hide');

                //var id = $(this).parents("tr").find(".ticketID").text();
                //var name = $(this).parents("tr").find(".ticketName").text();
                //var value = $(this).parents("tr").find(".ticketValue").text();

                // icely add
                var id = $(this).attr("ticketID-attr");
                var name = $(this).attr("ticketName-attr");
                var value = $(this).attr("ticketValue-attr");

                self.selectItem.text(name);
                self.selectItem.parents("td").attr("data-id", id);
                self.selectItem.parents("td").attr("data-values", value);

                self.calculateMoney();
                reset(true);

            });

            //师傅端填写金额
            $(document).on("input", ".ticketValue", function () {
                var td = $(this).parent("td");
                td.attr("data-values", $(this).val());
                self.calculateMoney();
            });

            //是否修改内容
            if (momo.getURLElement("id")) {
                self.lottery_id = momo.getURLElement("id");
                self.setData();
                $(".path").text("修改抽奖活动");
                $(".lotteryNum").attr("type", "text");
                $(".calendar.second").hide();
                $(".daterangepicker_start_input .input-mini").attr("readOnly", "true");
            }

            //监听计算各种费用
            $(document).on("click", ".daterangepicker .btn-success", self.calculateMoney.bind(self));//修改日期
            $(document).on("input", ".lotteryNum, #joinStartTime ,#joinEndTime ,#joinPeriod", self.calculateMoney.bind(self));//修改数量重新计算
        },


        // icely add
        initTable: function(){

            var url = '/Lottery/coupon';
            var editUrl = '';
            var colName = ['序号','券号','名称','面值','可用范围','可用条件','状态','有效期','类型', '创建时间', '操作'];
            var colModal = [
                { index: 'id', width:10, sort: false, formatter: setNum },
                { index: 'volume_number', width:20, sort: false },
                { index: 'volume_name', width:20, sort: false },
                { index: 'total', width:10, sort: false },
                { index: 'category', width:40, sort: false },
                { index: 'min', width:10, sort: false },
                { index: 'status', width:15, sort: false, formatter: setStatus },
                { index: 'start_time', width:20, sort: false, formatter: setTerm },
                { index: 'type', width:15, sort: false },
                { index: 'add_time', width:20, sort: false },
                { index: 'id', width:15, sort: false, formatter: setOperate },// 传入id，操作表单
            ];

            var data = { };
            this.tableObj = new $.jqGrid( $('#jqGrid'), url, data, colName, colModal, '400px', false, true, editUrl );

            // （辅助函数）设置状态（上线/下线）
            function setNum( val, rowData, index ) {
                var _num = ( lotteryNew.tableObj.currentPage - 1 ) *  lotteryNew.tableObj.data.page_size + ( index + 1 );
                return '<span>' + parseInt( _num ) + '</span>';
            }

            // （辅助函数）设置状态（上线/下线）
            function setStatus( val ) {
                return val == '1' ? '未生效' : '已生效';
            }

            // （辅助函数）设置 有效期
            function setTerm( val, rowData ){
                return '<span>从：' + rowData.start_time + '<br/>至：' + rowData.end_time + '</span>';
            }

            // （辅助函数）设置操作（this是 lottery对象）
            function setOperate( val, rowData ){

                return '<a class="selectTicketBtn btn btn-mini btn-primary" ' +
                    'ticketID-attr="' + rowData.volume_id + '" ticketName-attr="' + rowData.volume_name + '" ticketValue-attr="' + rowData.total + '">' +
                    '选择</a>';
            }
        },

        //获取电子券列表
        getList: function (id) {
            this.otherElem = {
                page: this.pageIndex,
                volume_name: this.searchTicketName,
                volume_num: this.searchTicketID,
                order: this.orderBy,
                by: this.sort
            };
            momo.sendPost(this.otherElem, "Lottery/coupon", function (data) {
                    if (data.errcode == 0) {
                        $("#ticketItemGroup").html("");
                        momo.setPage.call(this, data.page.total, data.page.total_pages);
                        data = data.data;
                        if (data.length < 1) {
                            $(".empty").show();
                            return;
                        }

                        var domStr = "";
                        var template = $("#ticketItem").text();
                        var itemGroup = $("#ticketItemGroup");

                        for (var i = 0, length = data.length; i < length; i++) {
                            var item = data[i];
                            var status = "未生效";
                            if (data.status)status = "已生效";

                            domStr += momo.template(template, {
                                status: status,
                                index: (this.pageIndex - 1) * 10 + i + 1,
                                id: item.volume_id,
                                ticketNumber: item.volume_number,
                                type: item.type,
                                value: item.total,
                                name: item.volume_name,
                                useRange: item.category,
                                useCondition: item.min,
                                start_at: "从:" + item.start_time,
                                end_at: "至:" + item.end_time,
                                createTime: item.add_time
                            });
                        }
                        itemGroup.append(domStr);
                    }
                    else console.log(data.errmsg);
                }.bind(this)
            )
        },

        //搜索特定项目
        search: function () {
            this.pageIndex = 1;
            this.searchTicketID = $("#searchTicketID").val();
            this.searchTicketName = $("#searchTicketName").val();
            //this.getList();//重新获取列表

            var _data = {
                "volume_name": this.searchTicketName,
                "volume_num": this.searchTicketID,
            };
            this.tableObj.reloadData( _data, true );
        },

        //添加话题//更新话题
        addItem: function () {
            var name = $(".name").val();
            var time = $(".time").val();
            var remark = $(".remark").val();
            var startTime = time.substr(0, 10);
            var endTime = time.substr(13, time.length);
            var pirzeList = [];//奖品对象数组

            var lotteryNameDom = $(".lotteryName");
            var ticketNameDom = $(".ticketName");
            var lotteryNumDom = $(".lotteryNum");

            var start_hour = $("#joinStartTime").val().replace(":00","");
            var end_hour = $("#joinEndTime").val().replace(":00","");
            var period = $("#joinPeriod").val().replace("小时","");
            if (this.type == 1) {
                start_hour = 0;
                end_hour = 1;
                period = 1;
            }

            if (parseInt(end_hour) < (parseInt(start_hour) + 1)) {
                alert("参与结束时间必须大于参与开始时间");
                return;
            }

            //遍历价格设置
            for (var i = 0; i < 7; i++) {
                var nameItem = lotteryNameDom.eq(i).val();
                var tNameItem = ticketNameDom.eq(i).attr("data-id");
                var valueItem = ticketNameDom.eq(i).attr("data-values");
                var numItem = lotteryNumDom.eq(i).val();
                if (nameItem == "") {
                    alert("请输入奖品内容");
                    lotteryNameDom.eq(i).focus().select();
                    return;
                }
                else if (numItem == "") {
                    alert("请输入奖品库存");
                    lotteryNumDom.eq(i).focus().select();
                    return;
                }else if( parseInt( numItem ) < 0  ||  parseInt( numItem ) != numItem ){

                    // 编辑页面，不能修改库存，所以不判断库存是否合法（新建页面，会跳入if执行）
                    if( !momo.getURLElement("id") ){
                        alert('库存只能输入0和正整数！');
                        lotteryNumDom.eq(i).focus().select();
                        return;
                    }

                }else if (tNameItem == "-1" && this.type == 1) {
                    alert("请选择电子券");
                    ticketNameDom.eq(i).focus().select();
                    return;
                }
                pirzeList.push({name: nameItem, volume_id: tNameItem, amount: valueItem, sku: numItem});
            }


            if (name == "")alert("请输入活动名称！");
            else if (time == "")alert("请输入有效期！");
            else {
                var body = {
                    "name": name,
                    "start_time": startTime,
                    "end_time": endTime,
                    "start_hour": start_hour,
                    "end_hour": end_hour,
                    "period": period,
                    "type": this.type,
                    "remark": remark,
                    "prizes": pirzeList
                };
                var url = "Lottery/add";
                var title = "新建提示";
                var message = "创建成功以后部分内容将不能进行修改，您确定要创建吗？";
                var alertText = "新建成功";

                if (this.lottery_id) {//若是修改话题
                    url = "/Lottery/update";
                    body.id = this.lottery_id;
                    title = "修改提示";
                    message = "您确定要修改吗？";
                    alertText = "修改成功";
                }

                bootbox.dialog({
                    title: "<i class='fa fa-exclamation-triangle orange2'></i>" + title,
                    message: message,
                    buttons: {
                        success: {
                            label: "确定",
                            className: "btn-success gritter-btn",
                            callback: function () {
                                momo.sendPost(body, url, function (data) {
                                    if (data.errcode == 0) {
                                        alert(alertText);
                                        window.location.href = "./lottery.html?type=" + momo.getURLElement("type");
                                    }
                                    else alert(data.errmsg);
                                }.bind(this));
                            }
                        },
                        main: {
                            label: "取消",
                            className: "btn",
                            callback: function () {
                                $("#myModal").modal('hide');
                            }
                        }
                    }
                });

            }
        },

        //计算各种数额
        calculateMoney: function () {
            //计算持续的日期,及每天的场次
            var time = $("#datePicker").val();
            var startTime = time.substr(0, 10);
            var endTime = time.substr(13, time.length);
            var dayNum = momo.getTimeSpace("day", startTime, endTime) + 1 || 0;//天数
            //console.log( dayNum );
            var startAt = $("#joinStartTime").val().replace(":00","");//场次开始时间
            var endAt = $("#joinEndTime").val().replace(":00",""); //场次结束时间
            var space = (endAt - startAt);//每天持续时间
            var period = $("#joinPeriod").val().replace("小时","");//参与周期
            this.timeNum = Math.floor(space / period);//每天参与轮次

            if (this.timeNum == 0)this.timeNum = 1;
            $(".timeNumText").text("日场次: " + this.timeNum);

            var _isNew = momo.getURLElement("id") == null ? true : false;// 是否是 新建
            //console.log( _isNew );

            //计算单项目的合计
            var sangleAll = 0;//单场总金额
            var lotteryNumDom = $(".lotteryNum");
            var ticketNameDom = $(".ticketName");
            var ticketSumDom = $(".valueSum");

            for (var i = 0; i < 7; i++) {

                var num = lotteryNumDom.eq(i).val() || 0;
                var value = ticketNameDom.eq(i).attr("data-values");
                var all = (num * value).toFixed(2);

                // 新建 才修改单项目的合计
                if( _isNew ){
                    ticketSumDom.eq(i).text(all);
                }
                sangleAll += Number( ticketSumDom.eq(i).text() );
            }
            //console.log( sangleAll );

            //计算各种总额
            $(".timeNum").text(this.timeNum);
            $(".allSum").text(sangleAll.toFixed(2));
            $(".oneSum").text(sangleAll.toFixed(2));
            $(".daySum").text((sangleAll * this.timeNum).toFixed(2));
            $(".allSum2").text((sangleAll * this.timeNum * dayNum).toFixed(2));
        },

        //获取并设置信息
        setData: function () {
            momo.sendPost({"id": this.lottery_id}, "Lottery/edit", function (data) {
                var type = momo.getURLElement("type");
                if (data.errcode == 0) {
                    data = data.data;
                    $(".name").val(data.name);
                    $(".remark").val(data.remark);
                    $("#joinStartTime").parent().html("<input type='text' id='joinStartTime' readonly/>");
                    $("#joinEndTime").parent().html("<input type='text' id='joinEndTime' readonly/>");
                    $("#joinPeriod").parent().html("<input type='text' id='joinPeriod' readonly/>");
                    $("#joinStartTime").val(data.start_hour+":00");
                    $("#joinEndTime").val(data.end_hour+":00");
                    $("#joinPeriod").val(data.period+"小时");

                    $(".time").val(data.start_time + " - " + data.end_time);
                    $(".timeNumText").text("日场次: " + data.times);
                    var nameList = $(".lotteryName");
                    var ticketList = $(".ticketName");
                    var numList = $(".lotteryNum");
                    var sumList = $(".valueSum");
                    this.ticketList = data.prize;
                    for (var i = 0, length = data.prize.length - 1; i < length; i++) {
                        var dataItem = data.prize[i + 1];
                        //nameList.eq(i).attr("readOnly", "true");
                        numList.eq(i).attr("readOnly", "true");
                        nameList.eq(i).val(dataItem.name);
                        nameList.eq(i).attr("readOnly", "true");

                        ticketList.eq(i).attr("data-id", dataItem.volume_id);
                        ticketList.eq(i).attr("data-values", dataItem.amount);
                        if (type == "2") {
                            ticketList.eq(i).find("input").attr("readOnly", "true");
                            ticketList.eq(i).find("input").val(dataItem.amount);
                        }
                        else ticketList.eq(i).find("a").text(dataItem.volume_name);
                        numList.eq(i).val((dataItem.sku - dataItem.used) + "/" + dataItem.sku);
                        sumList.eq(i).text((dataItem.sku * dataItem.amount).toFixed(2));
                    }

                    $(".allSum").text(data.per_amount);
                    $(".oneSum").text(data.per_amount);
                    $(".timeNum").text(data.times);
                    $(".daySum").text(data.per_amount * data.times);
                    $(".allSum2").text(data.amount);

                    //修改时间选择控件
                    var picket = $("#datePicker").data('daterangepicker');
                    picket.language = "cn";
                    picket.setStartDate(data.start_time);
                    picket.setEndDate(data.end_time);
                }
                else console.log(data.errmsg);
            }.bind(this));
        }
    }
})
();

var init = lotteryNew.init.bind(lotteryNew);