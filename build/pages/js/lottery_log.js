//等级列表接口
var lottery = (function () {
    return {
        pageIndex: 1,//标示当前页面数
        searchTime: "",//搜索的内容
        searchStartTime: "",//搜索的内容
        searchEndTime: "",//搜索的内容
        searchUserName: "",//搜索的内容
        searchName: "",//搜索的内容
        searchUserID: "",//搜索的内容
        searchID: "",//搜索的内容
        searchIDText: "",//搜索的内容
        otherElem: {},
        orderBy: "",
        sort: "",

        //初始化函数
        init: function () {
            console.log("init");
            var self = this;
            momo.initPage();
            momo.download.call(this, "Lottery/download");
            //动态接受参数进行设置
            var analyzeID = momo.getURLElement("id");
            var analyzeName = momo.getURLElement("name");
            if (analyzeID) {
                this.searchID = analyzeID;
                $("#searchID").attr("type", "text");
                $("#searchID").val("活动编码: " + analyzeID);
                $("#searchName").val("活动名称: " + analyzeName);
                $("#searchID").attr("readOnly", "true");
                $("#searchName").attr("readOnly", "true");
            }

            this.getList();
            momo.addPageEvent(self);
            $(document).on("click", ".searchBtn", self.search.bind(self));
            $(document).on("click", ".resetBtn", function () {//重置查询条件
                self.searchUserID = "";
                self.searchUserName = "";
                self.searchStartTime = "";
                self.searchEndTime = "";
                self.searchName = "";
                self.searchID = "";
                self.searchIDText = "";
                $("#searchUserName").val("");
                $("#searchUserID").val("");
                $("#searchTime").val("");
                $("#searchName").val("");
                $("#searchID").val("");
                $("#searchIDText").val("");
                self.getList();
            });
        },

        //点击约束
        checkClick: function (type) {},

        //获取本周争鸣列表信息
        getList: function (orderBy, sort) {
            if (orderBy != null)this.orderBy = orderBy;
            if (sort != null)this.sort = sort;
            this.otherElem = {
                page: this.pageIndex,
                name: this.searchName,
                user_id: this.searchUserID,
                user_name: this.searchUserName,
                lottery_id: this.searchID,
                rec_id: this.searchIDText,
                start: this.searchStartTime,
                end: this.searchEndTime,
                type: momo.getURLElement("type")
            };
            momo.sendPost(this.otherElem, "Lottery/log", function (data) {
                if (data.errcode == 0) {
                    $(".empty").hide();
                    $("#itemGroup").html("");
                    momo.setPage.call(this, data.page.total, data.page.total_pages);
                    data = data.data;
                    if (data.length < 1) {
                        $(".empty").show();
                        return;
                    }

                    var domStr = "";
                    var template = $("#item").text();
                    var itemGroup = $("#itemGroup");
                    for (var i = 0, length = data.length; i < length; i++) {
                        var dataItem = data[i];
                        domStr += momo.template(template, {
                            index: (this.pageIndex - 1) * 10 + i + 1,
                            id: dataItem.id,
                            IDText: dataItem.lottery_id,
                            name: dataItem.name,
                            userID: dataItem.user_id,
                            userName: dataItem.user_name,
                            statue: dataItem.prize_name,
                            value: dataItem.prize_amount,
                            time: dataItem.add_time
                        });
                    }
                    itemGroup.append(domStr);
                }
                else console.log(data.errmsg);
            }.bind(this));
        },

        //搜索特定项目
        search: function () {
            this.pageIndex = 1;
            var searchTime = $("#searchTime").val();
            this.searchUserID = $("#searchUserID").val();
            this.searchUserName = $("#searchUserName").val();
            this.searchName = $("#searchName").val();
            this.searchID = $("#searchID").val();
            this.searchIDText = $("#searchIDText").val();
            this.searchStartTime = searchTime.substr(0, 10);
            this.searchEndTime = searchTime.substr(13, searchTime.length);
            this.getList();//重新获取列表
        }

    }
})();

var init = lottery.init.bind(lottery);

