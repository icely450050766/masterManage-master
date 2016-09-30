var momo = (function () {
    return {
        //基础url
        baseURL: "",

        //初始化页面设置，添加头部，添加侧边栏,计算baseURL
        initPage: function () {
            //加载头部和左侧菜单
            Example.init({"selector": ".bb-alert"});
            $("body").append("<div class='loader' style='display: none;'><div class='loader-inner line-scale'><div></div><div></div><div></div><div></div><div></div></div></div>");//正在加载提示
            $("#header").load('iframe/header.html');

            // icely add （左边菜单 height 满屏）
            $(window).load( setMenuHeight );
            $(document).scroll( setMenuHeight );
            function setMenuHeight(){
                var _height = document.getElementsByClassName('main-content')[0].clientHeight;
                _height = _height < $(window).height() ? $(window).height() : _height;// 二者之中选最高的
                //console.log(_height);
                $('#sidebar').css( 'height', _height + 'px' );
            }

            $("#sidebar").load('iframe/sidebar.html', function () { //侧栏页面打开
                //获取左侧菜单a，并判断是否匹配
                function sidebarList() {
                    var aList = $('#sidebar a');
                    for (var i = 0, length = aList.length; i < length; i++) {
                        var aItem = aList.eq(i); //获取a标签的href
                        var aHref = aItem.attr("href"); //获取a标签的href
                        if (pageName.indexOf(aHref) != -1) {
                            aItem.parents('li').addClass('open');
                            aItem.parents('ul').show();

                            // icely add 选中的菜单项设置背景色
                            $('#sidebar .active').removeClass('active');
                            aItem.addClass('active');
                        }
                    }
                }
                var pageName = "";
                if ($('body').hasClass('routing'))pageName = $('.routing').attr('data-route');//为不存在侧栏的Page准备
                else {
                    var thisHREF = document.location.href;
                    var tmpHPage = thisHREF.split("/");
                    pageName = tmpHPage[tmpHPage.length - 1]; //获取哈希值前的URL链接
                }
                sidebarList();
            });


            $('input[name=date-range-picker]').daterangepicker({});//调用日期插件
            var host = window.location.host;
            var request_uri = window.location.pathname;
            var n = request_uri.indexOf("system");
            if (n > 0) host = host + request_uri.substring(0, n);
            //线上
            //this.baseURL = 'http://' + host;
            //本地
            this.baseURL = 'http://119.29.169.29/devzhaoshifu/admin.php/';
            //this.baseURL = 'http://119.29.169.29/zhaoshifu/admin.php/';
        },

        //清除各个sessionStorage
        removeSession: function (list) {
            for (var i = 0; i < list.length; i++)sessionStorage.removeItem(list[i]);
        },

        //获取URL参数
        getURLElement: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURI(r[2]);
            return null;
        },

        //发送post请求
        sendPost: function (body, url, success, isGet) {
            var way = "POST";
            if (isGet)way = "GET";
            $(".loader").show();
            console.log(JSON.stringify(body));
            console.log(this.baseURL + url);
            $.ajax({
                type: way,
                data: body,
                dataType: "JSON",
                url: this.baseURL + url,
                success: function (data) {
                    $(".loader").hide();
                    console.log(data);
                    if (data.errcode == 10000)window.location.href = './login.html';
                    success(data);
                },
                error: function (data) {
                    $(".loader").hide();
                    console.log("error ");
                    console.log(data);
                }
            });
        },

        //设置页面数
        setPage: function (sumItem, sumPage) {
            sumItem = parseInt(sumItem);
            sumPage = parseInt(sumPage);
            this.pageIndex = parseInt(this.pageIndex);
            console.log("this.pageIndex    " + this.pageIndex);
            //if ("#maxPageNum".length > 0)$("#maxPageNum").text(Math.ceil(sumPage / sumItem));
            $("#maxPageNum").text(sumPage);

            //去除全选
            this.isSelectAll = false;
            $(".selectAll").prop("checked", false);

            //清除旧的页面按钮
            var pageList = $(".pageNum");
            pageList.remove();

            $(".sumItemNum").text(sumItem);
            //上一页
            if (this.pageIndex === 1 || sumPage === 1)$(".prevBtn").addClass("disabled");
            else $(".prevBtn").removeClass("disabled");
            //下一页
            if (this.pageIndex === sumPage)$(".nextBtn").addClass("disabled");
            else $(".nextBtn").removeClass("disabled");
            //翻页按钮
            if (sumPage < 5) {
                for (var i = 1; i < (sumPage + 1); i++) {
                    if (this.pageIndex == i)$(".nextBtn").before("<li class='active pageNum'><span>" + i + "</span></li>");
                    else $(".nextBtn").before("<li class='pageNum'><span>" + i + "</span></li>");
                }
            }
            else {
                if (this.pageIndex < 3) {
                    for (var i = 1; i < (5 + 1); i++) {
                        if (this.pageIndex == i)$(".nextBtn").before("<li class='active pageNum'><span>" + i + "</span></li>");
                        else $(".nextBtn").before("<li class='pageNum'><span>" + i + "</span></li>");
                    }
                }
                else if (this.pageIndex > 2 && sumPage > (this.pageIndex + 1)) {
                    for (var i = this.pageIndex - 2; i < (this.pageIndex + 3); i++) {
                        if (this.pageIndex == i)$(".nextBtn").before("<li class='active pageNum'><span>" + i + "</span></li>");
                        else $(".nextBtn").before("<li class='pageNum'><span>" + i + "</span></li>");
                    }
                }
                else {
                    for (var i = sumPage - 4; i < (sumPage + 1); i++) {
                        if (this.pageIndex == i)$(".nextBtn").before("<li class='active pageNum'><span>" + i + "</span></li>");
                        else $(".nextBtn").before("<li class='pageNum'><span>" + i + "</span></li>");
                    }
                }
            }
        },

        //添加翻页点击约束
        addPageEvent: function (self) {
            //页面数点击
            $(document).on("click", ".pageNum", function () {
                if (self.checkClick && self.checkClick("deleteItem"))return;
                self.pageIndex = $(this).text();
                self.getList();
            });
            //上一页
            $(document).on("click", ".prevBtn", function () {
                if (self.checkClick && self.checkClick("deleteItem"))return;
                if (!$(this).hasClass("disabled")) {
                    self.pageIndex--;
                    self.getList();
                }
            });
            //下一页
            $(document).on("click", ".nextBtn", function () {
                if (self.checkClick && self.checkClick("deleteItem"))return;
                if (!$(this).hasClass("disabled")) {
                    self.pageIndex++;
                    self.getList();
                }
            });
            //页面跳转
            if ($("#pageJump").length > 0) {
                $(document).on("click", "#pageJump", function () {
                    var maxPage = $("#maxPageNum").text();
                    if (self.checkClick && self.checkClick("deleteItem"))return;
                    self.pageIndex = $("#inputPageNum").val();
                    if (self.pageIndex < 1) {
                        self.pageIndex = 1;
                        $("#inputPageNum").val(1);
                    }
                    else if (parseInt(self.pageIndex) > parseInt(maxPage)) {
                        self.pageIndex = maxPage;
                        $("#inputPageNum").val(maxPage);
                    }
                    self.getList();
                });
            }
        },

        //点击全选
        selectAll: function () {
            $(document).on("click", ".selectAll", function () {
                var checkBoxList = $(".checkbox");
                for (var i = checkBoxList.length - 1; i > -1; i--) {
                    checkBoxList.eq(i).prop("checked", $(".selectAll").prop("checked"));
                }
            });
        },

        //删除项目
        deleteItem: function (self, idName, URL, otherElem) {
            $(document).on("click", ".deleteItem", function () {
                if (self.checkClick && self.checkClick("deleteItem"))return;
                item = $(this).parents("tr");
                var body = {};
                body[idName] = item.find("." + idName).text();
                if (otherElem != null) {//添加其它参数
                    for (var p in otherElem) {
                        body[p] = otherElem[p];
                    }
                }
                momo.sendPost(body, URL, function (data) {
                    if (data.errmsg == "ok") {
                        Example.show("操作成功");
                        item.remove();
                        self.getList();
                    }
                    else alert(data.errmsg);
                }.bind(self));
            });
        },

        //删除项目
        resumeItem: function (self, idName, URL, otherElem) {
            $(document).on("click", ".resumeItem", function () {
                if (self.checkClick && self.checkClick("resumeItem"))return;
                item = $(this).parents("tr");
                var body = {};
                body[idName] = item.find("." + idName).text();
                if (otherElem != null) {//添加其它参数
                    for (var p in otherElem) {
                        body[p] = otherElem[p];
                    }
                }
                momo.sendPost(body, URL, function (data) {
                    if (data.errmsg == "ok") {
                        Example.show("操作成功");
                        item.remove();
                        self.getList();
                    }
                    else alert(data.errmsg);
                }.bind(self));
            });
        },

        //批量删除
        deleteSome: function (self, idName, URL, otherElem) {
            $(document).on("click", ".deleteSome", function () {
                if (self.checkClick && self.checkClick("deleteItem"))return;
                var objIdList = [];
                var checkBoxList = $(".checkbox");
                for (var i = checkBoxList.length - 1; i > -1; i--) {
                    if (checkBoxList.eq(i).prop("checked") == "checked" || checkBoxList.eq(i).prop("checked") == true) {
                        var item = {};
                        item[idName] = checkBoxList.eq(i).parents("td").next("." + idName).text();
                        objIdList.push(item);
                    }
                }
                var body = {};
                body[idName + "s"] = objIdList;
                if (otherElem != null) {//添加其它参数
                    for (var p in otherElem) {
                        body[p] = otherElem[p];
                    }
                }
                momo.sendPost(body, URL, function (data) {
                    if (data.errmsg == "ok") {
                        Example.show("操作成功");
                        self.getList();
                    }
                    else {
                        alert(data.errmsg);
                    }
                }.bind(this));
            });
        },

        //批量删除
        resumeSome: function (self, idName, URL, otherElem) {
            $(document).on("click", ".resumeSome", function () {
                if (self.checkClick && self.checkClick("deleteItem"))return;
                var objIdList = [];
                var checkBoxList = $(".checkbox");
                for (var i = checkBoxList.length - 1; i > -1; i--) {
                    if (checkBoxList.eq(i).prop("checked") == "checked" || checkBoxList.eq(i).prop("checked") == true) {
                        var item = {};
                        item[idName] = checkBoxList.eq(i).parents("td").next("." + idName).text();
                        objIdList.push(item);
                    }
                }
                var body = {};
                body[idName + "s"] = objIdList;
                if (otherElem != null) {//添加其它参数
                    for (var p in otherElem) {
                        body[p] = otherElem[p];
                    }
                }
                momo.sendPost(body, URL, function (data) {
                    if (data.errmsg == "ok") {
                        Example.show("操作成功");
                        self.getList();
                    }
                    else {
                        alert(data.errmsg)
                    }
                }.bind(this));
            });
        },

        //排序功能
        sort: function (className, getList, orderBy, list) {
            $(document).on("click", className, function () { //重置排序条件
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == className)continue;
                    $(list[i]).removeClass("sorting_desc");
                    $(list[i]).removeClass("sorting_asc");
                    $(list[i]).addClass("sorting");
                }
                console.log("sort");
                if ($(this).hasClass("sorting_asc")) {
                    $(this).removeClass("sorting_asc");
                    $(this).addClass("sorting_desc");
                    getList(orderBy, "desc");
                }
                else if ($(this).hasClass("sorting_desc")) {
                    $(this).removeClass("sorting_desc");
                    $(this).addClass("sorting");
                    getList("", "");
                }
                else if ($(this).hasClass("sorting")) {
                    $(this).removeClass("sorting");
                    $(this).addClass("sorting_asc");
                    getList(orderBy, "asc");
                }
            })
        },

        //下载功能
        download: function (url) {
            $(document).on("click", "#download", function () {
                console.log("download   " + momo.baseURL + url);
                console.log(JSON.stringify(this.otherElem));
                var fromDom = document.createElement("form");
                if (this.otherElem) for (var p in this.otherElem) {
                    var inputDom = document.createElement("input");
                    inputDom.name = p;
                    inputDom.value = this.otherElem[p];
                    fromDom.appendChild(inputDom);
                }
                fromDom.method = "post";
                fromDom.action = momo.baseURL + url;
                fromDom.submit();
            }.bind(this));
        },

        //数字输入约束
        inputNum: function (item, min, max) {
            $(document).on("change", item, function () {
                var value = $(this).val();
                if (min != null && value < min)$(this).val(min);
                else if (max != null && value > max)$(this).val(max);
            })
        },

        //字符输入字数约束
        inputText: function (item, max) {
            $(document).on("keydown", item, function () {
                var value = $(this).val();
                if (!(value.length < max))$(this).val(value.substr(0, max - 1));
            });
            $(document).on("keyup", item, function () {
                var value = $(this).val();
                if (!(value.length < max))$(this).val(value.substr(0, max));
            });
        },

        //JS模板
        template: function (text, obj) {
            for (p in obj) {
                while (text.search("<%=" + p + "%>") != -1)text = text.replace("<%=" + p + "%>", obj[p]);
            }
            return text;
        },

        //设置附件
        setAttachment: function (resource, theSize, container) {
            var size = theSize || 150;
            var imageTmpString = "<li> " +
                "<a href=<%=href%> data-rel='colorbox'> <img width='" + size + "' height='" + size + "' alt='" + size + "x" + size + "' src=<%=href%> /> " +
                "<div class='text'> " +
                "<div class='fileOpen'>预览</div> " +
                "<div class=' fileName'><%=name%></div> " + "</div> " + "</a> " + "</li>";
            var videoTmpString = "<li> " +
                "<a class='playVideo'> <video width='" + size + "' height='" + size + "' src=<%=href%> /> " +
                "<div class='fileIntuction'> " +
                "<div class='fileOpen'>播放</div> " +
                "<div class='fileName'><%=name%></div> </div> </a> </li>";
            var fileTmpString = "<li> " +
                "<a href=<%=href%>> " +
                "<img width=='" + size + "' height='" + size + "' alt='" + size + "x" + size + "' src='./img/file.png'/> " +
                "<div class='fileIntuction'> " +
                "<div class='fileOpen'>打开</div> " +
                "<div class='fileName'><%=name%></div> </div> </a> </li>";
            var styleString = "<style id='fileStyle'>" +
                ".fileIntuction { opacity: 0; transition: 0.3s all }" +
                ".fileIntuction:hover { opacity: 1; position: absolute; left: 0; top: 0; background-color: rgba(0, 0, 0, 0.5); height: 100%; width: 100% }" +
                ".fileOpen { text-align: center; width: 100%; position: absolute; top: 20%; word-break: break-all; color: white; font-size: 30px; font-weight: 800; }" +
                ".fileName { text-align: center; width: 100%; position: absolute; top: 60%; word-break: break-all; color: white; padding: 0 10px } " +
                "</style>";

            function initImage() {
                //添加图片预览功能
                var $overflow = '';
                var colorbox_params = {
                    rel: 'colorbox',
                    reposition: true,
                    scalePhotos: true,
                    scrolling: false,
                    previous: '<i class="ace-icon fa fa-arrow-left"></i>',
                    next: '<i class="ace-icon fa fa-arrow-right"></i>',
                    close: '&times;',
                    current: '{current} of {total}',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    onOpen: function () {
                        $overflow = document.body.style.overflow;
                        document.body.style.overflow = 'hidden';
                    },
                    onClosed: function () {
                        document.body.style.overflow = $overflow;
                    },
                    onComplete: function () {
                        $.colorbox.resize();
                    }
                };
                $('.ace-thumbnails [data-rel="colorbox"]').colorbox(colorbox_params);
                $("#cboxLoadingGraphic").html("<i class='ace-icon fa fa-spinner orange fa-spin'></i>");
            }

            //附件类型分类
            var imageDom = "";
            var fileDom = "";
            var videoDom = "";
            var site1 = location.pathname.indexOf("/", 0);
            var site2 = location.pathname.indexOf("/", site1 + 1);
            var baseUrl = location.pathname.substr(site1 + 1, site2);
            for (var i = 0, length = resource.length; i < length; i++) {
                var item = resource[i];
                //if (item.mime_type == "doc")fileDom += fileTemplate({href: "/innovateshare/" + item.url + "/cxshare", name: item.file_name});
                if (item.mime_type == "doc")fileDom += momo.template(fileTmpString, {href: "/" + baseUrl + "/" + item.url + "/cxshare", name: item.file_name});
                else if (item.mime_type == "image")imageDom += momo.template(imageTmpString, {href: item.url, name: item.file_name});
                else if (item.mime_type == "video")videoDom += momo.template(videoTmpString, {href: item.url, name: item.file_name});
            }

            //添加样式
            var containerName = container || "#imageContainer";
            if ($("#fileStyle").length < 1)$("body").before(styleString);
            $(containerName).append(imageDom);//设置图片预览
            initImage();
            $(containerName).append(fileDom);//设置文件显示
            $(containerName).append(videoDom);//设置视频显示

            //设置视频点击播放
            $(document).on("click", ".playVideo", function (e) {
                var target = $(this).find("video")[0];
                if (target.webkitRequestFullScreen)target.webkitRequestFullScreen();
                else if (target.requestFullScreen)target.requestFullScreen();
                else if (target.mozRequestFullScreen)target.mozRequestFullScreen();
            });


        },

        //获取日期差距
        getTimeSpace: function (type, startTime, endTime) {
            var startTime = new Date(startTime.replace("-", "/"));
            var endTime = new Date(endTime.replace("-", "/"));
            var space = endTime.getTime() - startTime.getTime();
            if (type == "day")return parseInt(space / (1000 * 60 * 60 * 24));
        },

    }
})();


