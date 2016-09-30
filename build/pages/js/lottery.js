//等级列表接口
var lottery = (function () {
    return {
        type: 1,//标示当前是业主端还是师傅端
        pageIndex: 1,//标示当前页面数
        searchStatus: "-1",//搜索的显示类型
        searchName: "",//搜索的内容
        searchAuthor: "",//搜索的内容
        searchStartTime: "",//搜索的内容
        searchEndTime: "",//搜索的内容
        detailItemId: "",//显示详情项目ID
        otherElem: {},
        orderBy: "",
        sort: "",

        //初始化函数
        init: function () {
            var self = this;
            momo.initPage();
            this.getList();
            momo.addPageEvent(self);
            momo.deleteItem(self, "id", "Lottery/changestatus", {"status": "0"});
            momo.resumeItem(self, "id", "Lottery/changestatus", {"status": "1"});
            $(document).on("click", ".searchBtn", self.search.bind(self));
            $(document).on("click", ".resetBtn", function () {//重置查询条件
                self.searchAuthor = "";
                self.searchStartTime = "";
                self.searchEndTime = "";
                self.searchName = "";
                self.searchStatus = "-1";
                $("#searchAuthor").val("");
                $("#searchTime").val("");
                $("#searchName").val("");
                $("#searchStatus").val("-1");
                self.getList();
            });
            $(".newOne").attr("href", "./lottery_new.html?type=" + momo.getURLElement("type"));
        },

        //点击约束
        checkClick: function (type) {},

        //获取列表信息
        getList: function (orderBy, sort) {
            this.type = momo.getURLElement("type");
            if (orderBy != null)this.orderBy = orderBy;
            if (sort != null)this.sort = sort;
            this.otherElem = {
                type: this.type,
                page: this.pageIndex,
                name: this.searchName,
                admin_user: this.searchAuthor,
                start: this.searchStartTime,
                end: this.searchEndTime,
                status: this.searchStatus,
                order: this.orderBy,
                by: this.sort
            };
            momo.sendPost(this.otherElem, "Lottery/index", function (data) {
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
                        var status = "下线";
                        var action = "上线";
                        var showAction = "resumeItem";
                        if (dataItem.status == 1) {
                            status = "上线";
                            action = "下线";
                            showAction = "deleteItem";
                        }

                        domStr += momo.template(template, {
                            index: (this.pageIndex - 1) * 10 + i + 1,
                            id: dataItem.id,
                            name: dataItem.name,
                            start_at: "起:" + dataItem.start_time,
                            end_at: "止:" + dataItem.end_time,
                            moneyStatus: dataItem.used + "/" + dataItem.amount,
                            create_at: dataItem.add_time,
                            author: dataItem.admin_id,
                            remark: dataItem.remark,
                            showAction: showAction,
                            status: status,
                            action: action,
                            parameter: "type=" + this.type + "&id=" + dataItem.id + "&name=" + dataItem.name
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
            this.searchStatus = $("#searchStatus").val();
            this.searchName = $("#searchName").val();
            this.searchAuthor = $("#searchAuthor").val();
            this.searchStartTime = searchTime.substr(0, 10);
            this.searchEndTime = searchTime.substr(13, searchTime.length);
            this.getList();//重新获取列表
        }

    }
})();

var init = lottery.init.bind(lottery);