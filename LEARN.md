[1] 获取子元素   :$("#name").children()[2];
[2] 获取元素的内容     :$("#name").textContent = item.value;
[3] 获取id下的class元素   :$(#name).find(".num")      即find是进行第二次匹配
[4] POST请求中，form-data和row的区别，form-data是直接传递参数，后端通过POST.GET(KEY)获取值。而row则是直接传递一个json子串。需要使用json。data: JSON.stringify(body),
[5] jq的ajax一般使用 $.ajax({//这种形式进行编写
                           type: "POST",
                           data: JSON.stringify(body),
                           dataType: "JSON",
                           url: "http://testinnovation.silijiren.info/innovateshare/api/creative/admin/coin/setConfig",
                           success: function (data) {
                               console.log("success  " + data);
                               console.log(data);
                               if (data.errmsg == "ok") {
                                   obj.textContent = "修改";
                               }
                           },
                           error: function (data) {
                               console.log("error  " + data);
                           }
                       });