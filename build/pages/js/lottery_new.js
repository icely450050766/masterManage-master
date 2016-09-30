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
            function reset() {//重置查询条件
                self.searchTicketID = "";
                self.searchTicketName = "";
                $("#searchTicketID").val("");
                $("#searchTicketName").val("");
                self.getList();
            }

            momo.initPage();
            momo.addPageEvent(self);
            $(document).on("click", ".searchBtn", self.search.bind(self));
            $(document).on("click", ".resetBtn", reset);
            self.ticketHtml = $("#ticket").html();
            $("#ticket").remove();
            $(".headerURl").attr("href", "./lottery.html?type=" + momo.getURLElement("type"));
            $(".routing").attr("data-route", "./lottery.html?type=" + momo.getURLElement("type"));

            //设置是否是师傅端
            if (momo.getURLElement("type") == "2") {
                this.type = 2;
                this.timeNum = 3;
                $(".type2").show();
                $(".timeNum").text("3");
                //修改电子卷列表
                $(".ticketTitle").text("金额(元)");
                $(".ticketName").html("<input type='number' class='ticketValue'/>");
            }

            //点击发布
            $(document).on("click", ".submitBtn", this.addItem.bind(this));

            //取消新建
            $(document).on("click", ".cancelBtn2", function () {location.href = "./lottery.html?type=" + momo.getURLElement("type");});

            //打开电子卷列表
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
                    window.setTimeout(function () {self.getList();}, 0);
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
                            }
                        }
                    );
                    console.log(self._bootbox);
                    $(".btn-success2").hide();
                }
            });

            //新建时选择电子券
            $(document).on("click", ".selectTicketBtn", function () {
                self._bootbox.modal('hide');
                var id = $(this).parents("tr").find(".ticketID").text();
                var name = $(this).parents("tr").find(".ticketName").text();
                var value = $(this).parents("tr").find(".ticketValue").text();
                self.selectItem.text(name);
                self.selectItem.parents("td").attr("data-id", id);
                self.selectItem.parents("td").attr("data-values", value);
                self.calculateMoney();
                reset();

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
            $(document).on("input", ".lotteryNum", self.calculateMoney.bind(self));//修改数量重新计算
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
                                //value: item.total,
                                value: item.total * 100,
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
            this.getList();//重新获取列表
        },

        //添加话题//更新话题
        addItem: function () {
            var name = $(".name").val(),
                time = $(".time").val(),
                remark = $(".remark").val(),
                startTime = time.substr(0, 10),
                endTime = time.substr(13, time.length);
            var pirzeList = [];//奖品对象数组

            var lotteryNameDom = $(".lotteryName");
            var ticketNameDom = $(".ticketName");
            var lotteryNumDom = $(".lotteryNum");

            var start_hour = $("#joinStartTime").val();
            var end_hour = $("#joinEndTime").val();
            var period = $("#joinPeriod").val();
            if (this.type == 1) {
                start_hour = 0;
                end_hour = 1;
                period = 1;
            }

            //遍历价格设置
            for (var i = 0; i < 7; i++) {
                var nameItem = lotteryNameDom.eq(i).val();
                var tNameItem = ticketNameDom.eq(i).attr("data-id");
                var valueItem = ticketNameDom.eq(i).attr("data-values");
                var numItem = lotteryNumDom.eq(i).val();
                if (nameItem == "") {
                    alert("请输入奖品内容");
                    return;
                }
                else if (numItem == "") {
                    alert("请输入奖品库存");
                    return;
                }
                else if (tNameItem == "-1" && this.type == 1) {
                    alert("请选择电子卷");
                    return;
                }
                pirzeList.push({name: nameItem, volume_id: tNameItem, amount: valueItem, sku: numItem});
            }


            if (name == "")alert("请输入活动名称");
            else if (time == "")alert("请输入持续时间");
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
                                        window.location.href = "./lottery.html";
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
            //计算持续的日期
            var time = $("#datePicker").val();
            var startTime = time.substr(0, 10);
            var endTime = time.substr(13, time.length);
            var dayNum = momo.getTimeSpace("day", startTime, endTime) || 0;//天数

            //计算单项目的合计
            var sangleAll = 0;//单场总金额
            var lotteryNumDom = $(".lotteryNum");
            var ticketNameDom = $(".ticketName");
            var ticketSumDom = $(".valueSum");
            for (var i = 0; i < 7; i++) {
                var num = lotteryNumDom.eq(i).val() || 0;
                var value = ticketNameDom.eq(i).attr("data-values");
                var all = (num * value).toFixed(2);
                ticketSumDom.eq(i).text(all);
                sangleAll += Number(all);
            }

            //计算各种总额
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
                    $("#joinStartTime").val(data.start_hour);
                    $("#joinEndTime").val(data.end_hour);
                    $("#joinPeriod").val(data.period);
                    $(".time").val(data.start_time + " - " + data.end_time);
                    var nameList = $(".lotteryName");
                    var ticketList = $(".ticketName");
                    var numList = $(".lotteryNum");
                    var sumList = $(".valueSum");
                    this.ticketList = data.prize;
                    for (var i = 0, length = data.prize.length - 1; i < length; i++) {
                        var dataItem = data.prize[i + 1];
                        nameList.eq(i).attr("readOnly", "true");
                        numList.eq(i).attr("readOnly", "true");
                        nameList.eq(i).val(dataItem.name);
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