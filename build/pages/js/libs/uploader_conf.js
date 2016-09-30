$(function() {
  var files = []; //上传的图片数组

  //将图片转化为数据库的存储格式
  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
      type: mimeString
    });
  }

  //上传图片
  function upload(file) {
    var fd = new FormData();
    fd.append('file', dataURItoBlob(file.dataURL), file.name);
    $.ajax({
      type: 'POST',
      url: 'http://testinnovation.silijiren.info/innovateshare/api/qiniuupload/index',
      data: fd,
      processData: false,
      contentType: false,
      success: function(res) { //上传成功
        //读取xml格式
        var file_id = res.getElementsByTagName("file_id");
        var file_name = res.getElementsByTagName("file_name");
        $("#pictureID").text(file_id[0].innerHTML); //保存图片ID
        console.log("上传成功   图片ID为   " + file_id[0].innerHTML); //图片file_id
      },
      error: function(err) {
        console.log(err);
      }
    });
  }

  //监听上传的文件变化
  $('#uploadBtn').on('change', function(e) {
    var file = e.target.files[0]; //获取用户选中的文件，并获取第一张
    if (file) {
      if (/^image\//i.test(file.type)) { //判断是否是图片格式
        var reader = new FileReader(); //获取文件读取器
        //文件读取器读取文件的事件监听
        reader.onloadend = function() { //文件加载完成
          var img = new Image(); //新建img对象
          img.onload = function() { //设置其onload事件
            //将图片数据使用canvas显示，并获取其base64编码，最终在页面中通过img显示
            var w = Math.min(400, img.width); // 当图片宽度超过 400px 时, 就压缩成 400px, 高度按比例计算
            var h = img.height * (w / img.width);
            var canvas = document.createElement('canvas');
            canvas.width = w; // 设置 canvas 的宽度和高度
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h); // 把图片绘制到 canvas 中
            var dataURL = canvas.toDataURL('image/png'); //借助canvas临时保存文件，用于在页面中使用img显示
            $(".poster").prop("src", dataURL); //设置页面中的显示

            //上传图片
            files.push({
              name: file.name,
              dataURL: dataURL
            });
            files.forEach(upload);
          };
          img.src = reader.result; //加载img对象
        };
        reader.onerror = function() {
          console.error('reader error');
        };

        //实际操作，文件读取器，以URL的方式读取图片文件，使用base-64进行编码
        reader.readAsDataURL(file);
      } else {
        throw '只能上传图片';
      }
    }
  });


});
