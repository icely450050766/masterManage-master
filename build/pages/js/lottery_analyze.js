//等级列表接口
var lottery = (function () {
    return {
        pageIndex: 1,//标示当前页面数
        searchType: "",//搜索的内容
        searchStartTime: "",//搜索的内容
        searchEndTime: "",//搜索的内容
        searchName: "",//搜索的内容
        searchID: "",//搜索的内容
        otherElem: {},
        orderBy: "",
        sort: "",

        //初始化函数
        init: function () {
            console.log("init");
            var self = this;
            momo.initPage();
            this.getList();
            momo.addPageEvent(self);
            function resetAll() {
                self.searchStartTime = "";
                self.searchEndTime = "";
                self.searchName = "";
                self.searchID = "";
                $("#searchTime").val("");
                $("#searchName").val("");
                $("#searchIDText").val("");
                self.getList();
            }

            $(".logHref").attr("href", "lottery_log.html?type=" + momo.getURLElement("type"));
            $(document).on("click", ".searchBtn", self.search.bind(self));
            $(document).on("click", ".resetBtn", resetAll);//重置查询条件
            $(document).on("click", ".jumpBtn", function () {//点击明细
                var id = $(this).parents("tr").find('.id').text();
                var name = $(this).parents("tr").find('.name').text();
                location.href = "./lottery_log.html?type=" + momo.getURLElement("type") + "&id=" + id + "&name=" + name;
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
                page_size: "10",
                name: this.searchName,
                lottery_id: this.searchID,
                start: this.searchStartTime,
                end: this.searchEndTime,
                status: this.searchStatus,
                group: this.searchType,
                type: momo.getURLElement("type")
            };
            momo.sendPost(this.otherElem, "Lottery/stastics", function (data) {
                if (data.errcode == 0) {
                    if (this.searchType) {
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
                                name: dataItem.name,
                                joinNum: dataItem.count,
                                moneyNum: dataItem.amount
                            });
                        }
                        itemGroup.append(domStr);
                    }
                    else {
                        $(".tab1 .joinNum").text(data.data.count);
                        $(".tab1 .sumMoney").text(data.data.amount);
                    }

                }
                else console.log(data.errmsg);
            }.bind(this));
        },

        //搜索特定项目
        search: function () {
            this.pageIndex = 1;
            var searchTime = $("#searchTime").val();
            this.searchName = $("#searchName").val();
            this.searchID = $("#searchIDText").val();
            this.searchType = $("#searchType").val();
            this.searchStartTime = searchTime.substr(0, 10);
            this.searchEndTime = searchTime.substr(13, searchTime.length);
            this.getList();//重新获取列表
            if (this.searchType == 0) {
                $(".tab2").hide();
                $(".tab1").show();
            }
            else {
                $(".tab1").hide();
                $(".tab2").show();
            }
        }

    }
})();

var init = lottery.init.bind(lottery);

