/**
 * Created by Administrator on 2016/10/5.
 */
var setting = (function($){
    return{

        currentTabIndex: 0, // 当前显示的tab
        projectImg_upLoadImg: null, // 产品图片 上传按钮（类对象）
        othersImg_upLoadImg: null, // 产品介绍图片 上传按钮（类对象）

        //初始化
        init: function(){

            /*
            // 自动保存
            // sendPost 失败，重新读取数据（因为编辑表格内容时，点击确认先更新表格再保存。如果保存失败，表格要恢复原状，用重新读取数据来恢复表格）
            $(document).on('postError', function(){
                if( this.currentTabIndex != 1 ){ // 免费领取（保存失败不刷新数据）
                    this.initAllData();// 读取所有后台数据,初始化 所有tabs
                }
            }.bind( this ));
            */

            momo.initPage();// 左边菜单栏

            this.tabsEvent();// 点击tabs 切换事件监听
            $('ul.tabs > li').eq(0).trigger('click');// 默认选中第一个tab

            this.addBtnEvent();// 按钮点击事件
            this.addInputLimit();// 模态框输入限制
            //this.initAllData();// 读取所有后台数据,初始化 所有tabs
        },

        // 点击tabs 切换事件监听
        tabsEvent: function(){

            var _self = this;
            var $tabArr = $('ul.tabs > li');
            var $tabContentArr = $('.tabs-content > div');

            $tabArr.each( function( index ){
                $(this).click( function(){

                    _self.currentTabIndex = index;// 当前显示的tab

                    // tabs 样式
                    $('ul.tabs > li.active').removeClass('active');
                    $(this).addClass('active');

                    // tabs 内容样式
                    $('.tabs-content > .active').removeClass('active');
                    $tabContentArr.eq( index ).addClass('active');

                    // 其他tabs 的保存按钮 不可用（防止后两个tabs 修改数据 自动保存，trigger('click')提交多次）
                    $('.saveBtn').prop('disabled', 'true');
                    $('.tabs-content > .active').find('.saveBtn').removeProp('disabled');

                    // 重新载入全部数据（读取所有后台数据,初始化 所有tabs）
                    _self.initAllData();
                });
            });
        },

        // 读取所有后台数据，初始化 tab-content
        initAllData: function(){

            var _self = this;
            momo.sendPost({}, 'WaterPurifier/index', function(data){
                data = data.data;
                console.log( data );

                //产品介绍
                $('#projectImg').empty();
                $('#othersImg').empty();

                if( !momo.isNoData( data.introduce.cover_pic ) ){
                    $('#projectImg').html('<div class="imgBox"><img src="' + data.introduce.cover_pic + '"><div class="removeImg">&times;</div></div>');
                }
                if( data.introduce.pics.length ){
                    var _content = '';
                    for( var i=0; i < data.introduce.pics.length; i++ ){
                        _content += '<div class="imgBox"><img src="' + data.introduce.pics[i] + '" name="icely"><div class="removeImg">&times;</div></div>';
                    }
                    $('#othersImg').html( _content );
                }
                _self.projectImg_upLoadImg = new upLoadImg( $('#projectImg'), 1 ); // 插入 添加图片 按钮
                _self.othersImg_upLoadImg = new upLoadImg( $('#othersImg'), 6 );

                // 免费领取
                $('.actually_name').val( data.receive.receive_actually_price.name).attr( 'readonly', 'true' );
                $('.actually_price').val( data.receive.receive_actually_price.price ).attr( 'readonly', 'true' );
                $('.activity_price').val( data.receive.receive_activity_price.price ).attr( 'readonly', 'true' );
                $('.activity_day').val( data.receive.receive_activity_day ).attr( 'readonly', 'true' );
                $('.deliver_name').val( data.receive.receive_deliver_price.name ).attr( 'readonly', 'true' );
                $('.deliver_price').val( data.receive.receive_deliver_price.price ).attr( 'readonly', 'true' );
                $('.install_name').val( data.receive.receive_install_price.name ).attr( 'readonly', 'true' );
                $('.install_price').val( data.receive.receive_install_price.price ).attr( 'readonly', 'true' );
                $('.description').val( data.receive.receive_description).attr( 'readonly', 'true' ).css( 'background', 'rgb(245,245,245)' );
                $('.description').parents('.row').next('.row').children('.btn').text('编辑').removeClass('saveBtn').addClass('editBtn');// 编辑/保存 按钮

                // 初始化“更换滤芯”表格
                initTable_change.call( _self, data.replace );

                // 初始化“维修配置”表格
                initTable_repair.call( _self, data.repair );

            },function(){
                alert('获取数据失败！')
            });

            // （辅助函数）初始化“更换滤芯”表格
            function initTable_change( data ){

                //console.log( data );
                if( data.replace_service_price ){
                    $('.service_price_name').val( data.replace_service_price.name );
                    $('.service_price_price').val( data.replace_service_price.price );
                    $('.replace_suggest_day').val( data.replace_suggest_day.day );
                }else{
                    $('.service_price_name').val('');
                    $('.service_price_price').val('');
                    $('.replace_suggest_day').val('');
                }

                initChangeOrRepairTbody.call( this, data.item, $('#changeTbody') );
                this.setNewOneBtnStyle( 2 ); // 设置 当前显示tab 的 新建按钮 样式
            }

            // （辅助函数）初始化“维修配置”表格
            function initTable_repair( data ){

                //console.log( data );
                if( data.repair_repair_price ){
                    $('.repair_price_name').val( data.repair_repair_price.name );
                    $('.repair_price_price').val( data.repair_repair_price.price );
                }else{
                    $('.repair_price_name').val('');
                    $('.repair_price_price').val('');
                }

                initChangeOrRepairTbody.call( this, data.item, $('#repairTbody') );
                this.setNewOneBtnStyle( 3 ); // 设置 当前显示tab 的新建按钮样式
            }

            // （辅助函数）初始化“更换滤芯”“维修配置”tbody
            function initChangeOrRepairTbody( data, $tbody ){

                $tbody.empty();
                var _content = '';

                //console.log( data );
                if( data ){
                    for( var i=0; i < data.length; i++ ){
                        _content += '<tr statusAttr=' + data[i].status + '>' +
                            '<td class="num">' + (i+1) + '</td>' +
                            '<td class="name">' + data[i].name + '</td>' +
                            '<td class="price">' + data[i].price + '</td>' +
                            '<td class="op" style="overflow: hidden">' +
                            '<a class="btn btn-mini btn-primary tableInnerBtn" onclick="setting.openAndInitEditModal( $(this), false );">编辑</a>' +
                            '<a class="btn btn-mini btn-primary tableInnerBtn setStatusBtn">' + ( data[i].status == '1' ? '禁用' : '启用') + '</a>' +
                            '<a class="btn btn-mini btn-primary tableInnerBtn delBtn">删除</a>' +
                            '</td> ' +
                            '</tr>';
                    }
                }
                $tbody.html( _content );
            }
        },

        // （无用）（后面两个tabs）点击表格上方“编辑”按钮，打开编辑模态框，参数：点开模态框的按钮jq对象（编辑按钮）
        openAndInitConfigEditModal: function( btnHandle ){

            var _self = this;

            // 打开模态框
            bootbox.confirm({
                title: '编辑',
                message: $('#editConfigModal').text(),
                buttons: {
                    confirm: {
                        label: '确认',
                        className: 'btn btn-sm btn-primary width80'
                    },
                    cancel: {
                        label: '取消',
                        className: 'btn btn-sm btn-inverse width80'
                    }
                },
                callback: function(result) {
                    if( result ) { // 确认

                        // 判断输入是否完整（合法在addInputLimit()中限制）
                        if( !_self.judgeEditInputIsNone( $('.editName') )  ||  !_self.judgeEditInputIsNone( $('.editPrice') ) ) return false;
                        if( _self.currentTabIndex == 2  &&  !_self.judgeEditInputIsNone(  $('.editDay') ) ) return false; // 更换滤芯

                        // 更新表格数据
                        $inputName.val( $('.editName').val() );
                        $inputPrice.val( $('.editPrice').val() );
                        if( _self.currentTabIndex == 2 )  $inputDay.val( $('.editDay').val() ); // 更换滤芯

                        // 自动保存
                        $('.saveBtn').trigger('click');// 自动保存 模拟 点击保存按钮
                        $(document).one('tipShow', function(){ // 监听一次 tipShow事件
                            //console.log('tipShow');
                            bootbox.hideAll();// 关闭模态框（保存成功/点击取消按钮才关闭模态框）
                        });

                        return false;// 不关闭模态框

                    }
                },
            });

            // 正在编辑的 配置
            var $inputName = btnHandle.parents('form').find('input[type=text].configName'); // 点开模态框的按钮 前面的 名称input
            var $inputPrice = btnHandle.parents('form').find('input[type=number].configPrice'); // 点开模态框的按钮 前面的 金额input
            var $inputDay = btnHandle.parents('form').find('.replace_suggest_day'); // 点开模态框的按钮 前面的 更换时间建议input

            // 初始化数据
            $('.editName').val( $inputName.val() );
            $('.editPrice').val( $inputPrice.val() );

            // 更换时间建议
            if( _self.currentTabIndex == 2 ){ // 更换滤芯
                $('.editDay').val( $inputDay.val() );

            }else{ // 维修服务
                $('.editDay').parents('#dayRow').remove();
            }

        },

        // （后面两个tabs）点击表格内部“编辑”按钮，打开编辑模态框，参数：点开模态框的按钮jq对象（编辑按钮/新建按钮）、是否是新建
        openAndInitEditModal: function( btnHandle, isNewOne ){

            var _self = this;

            // 根据 当前显示的tab，确定正在编辑的tbody
            var $tbody = ( this.currentTabIndex == 3 ) ? $('#repairTbody') : $('#changeTbody');

            // 打开模态框
            var _title = isNewOne ? '新建' : '编辑'; // 标题
            bootbox.confirm({
                title: _title,
                message: $('#editModal').text(),
                buttons: {
                    confirm: {
                        label: '确认',
                        className: 'btn btn-sm btn-primary width80'
                    },
                    cancel: {
                        label: '取消',
                        className: 'btn btn-sm btn-inverse width80'
                    }
                },
                callback: function(result) {
                    if( result ) { // 确认

                        // 判断输入是否完整（合法在addInputLimit()中限制）
                        if( !_self.judgeEditInputIsNone( $('.editName') )  ||  !_self.judgeEditInputIsNone( $('.editPrice') ) ) return false;

                        // 更新表格数据
                        $('.name', $tr).text( $('.editName').val() );
                        $('.price', $tr).text( $('.editPrice').val() );

                        // 新建
                        if( isNewOne ){
                            $tbody.append( $tr );// （新建）插入到表格中
                            _self.setNewOneBtnStyle( _self.currentTabIndex ); // 设置 当前显示tab 的新建按钮样式
                        }

                        bootbox.hideAll();// 关闭模态框

                        /*
                        // 自动保存
                        $('.saveBtn').trigger('click');// 自动保存 模拟 点击保存按钮
                        $(document).one('tipShow', function(){ // 监听一次 tipShow事件
                            //console.log('tipShow');
                            bootbox.hideAll();// 关闭模态框（保存成功/点击取消按钮才关闭模态框）
                        });

                        return false;// 不关闭模态框
                        */

                    }
                },
            });

            // 正在编辑的行
            var $tr = null;
            if( isNewOne ){ // 新建tr( 默认启用 )
                var _index = $tbody.children('tr').length + 1;// 序号

                $tr = $('<tr statusAttr="1"> <td class="num">' + _index + '</td> <td class="name"></td> <td class="price"></td> <td>' +
                        '<a class="btn btn-mini btn-primary tableInnerBtn" onclick="setting.openAndInitEditModal( $(this), false );">编辑</a>' +
                        '<a class="btn btn-mini btn-primary tableInnerBtn setStatusBtn">禁用</a>' +
                        '<a class="btn btn-mini btn-primary tableInnerBtn delBtn">删除</a>' +
                    '</td> </tr>');


            }else{
                $tr = btnHandle.parents('tr'); // 点开模态框的按钮 所在tr

                // 不是新建时，初始化数据
                $('.editName').val( $('.name', $tr).text() );
                $('.editPrice').val( $('.price', $tr).text() );
            }

        },

        // 判断 （编辑模态框）输入是否为空。如果为空，返回false( 不保存、不关闭模态框 )
        judgeEditInputIsNone: function( $input ){

            if( momo.isNoData( $input.val() ) ){

                $input.focus().val('');// 获得焦点
                $input.addClass('errorTip');

                // 设置 placeholder
                var _placeholder = $input.attr('placeholder');
                if( _placeholder.indexOf('请输入：') == -1 ){ // 没有匹配的字段
                    $input.attr('placeholder', '请输入：' + _placeholder);
                }
                return false;

            }else{
                return true;
            }
        },


        // 按钮点击事件
        addBtnEvent: function(){

            var _self = this;

            // 保存按钮
            $(document).on( 'click', '.saveBtn', function(){

                var $saveBtn = $(this);
                $saveBtn.prop( 'disabled', true );// 保存按钮不可点击状态
                //$saveBtn.trigger('click');// 再次点击保存按钮，查看 network，请求是否成功

                switch( _self.currentTabIndex ){

                    case 0 : { // 产品介绍 tab

                        var _data = {
                            'cover_pic' : null,
                            'pics' : null,
                        };

                        // 不断查询图片是否已上传，并返回图片url
                        var temp = setInterval( function(){
                            if( _data.cover_pic != null  &&  _data.pics != null ){ // 已被赋值
                                console.log( _data );
                                clearInterval( temp );

                                // 必填项
                                if( _data.cover_pic == '' ){
                                    alert('请上传净水器产品图片！');
                                    $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                                    return;
                                }
                                if( _data.pics == '' ){
                                    alert('请上传至少一张净水器产品介绍图片！');
                                    $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                                    return;
                                }

                                // 保存数据
                                momo.sendPost( _data, 'WaterPurifier/addIntroduce', function( data ){

                                    if( !data.errcode ){
                                        momo.showTip('保存成功');// 提示内容，并且发送一个事件
                                        $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                                    }
                                    else{
                                        $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                                        alert( data.errmsg );
                                        _self.initAllData();// 读取所有后台数据,初始化 所有tabs
                                    }

                                }, function(){
                                    $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                                    alert('保存失败！');
                                });
                            }
                        }, 50);


                        // 上传所有图片
                        _self.projectImg_upLoadImg.upLoadAll();
                        _self.othersImg_upLoadImg.upLoadAll();

                        // 监听图片上传完成事件（谁触发的 谁接收？）e.currentTarget == e.delegateTarget
                        _self.projectImg_upLoadImg.$upLoadBtn.one( 'upLoadFinish', function(e){

                            var _resultArr = _self.projectImg_upLoadImg.imgUploadInfoArr;
                            //console.log( _resultArr );
                            _data.cover_pic = _resultArr.length ? _resultArr[0].url : '';
                        });

                        _self.othersImg_upLoadImg.$upLoadBtn.one( 'upLoadFinish', function(e){

                            var _resultArr = _self.othersImg_upLoadImg.imgUploadInfoArr;
                            //console.log( _resultArr );

                            var _arr = [];
                            for( var i=0; i < _resultArr.length; i++ ) _arr.push( _resultArr[i].url );
                           _data.pics = _arr;
                        });

                        break;
                    }

                    case 1 : { // 免费领取 tab

                        var _body = {
                            "actually_name" : $('.actually_name').val(),
                            "actually_price" : $('.actually_price').val(),
                            "activity_price" : $('.activity_price').val(),
                            "activity_day" : $('.activity_day').val(),
                            "deliver_name" : $('.deliver_name').val(),
                            "deliver_price" : $('.deliver_price').val(),
                            "install_name" : $('.install_name').val(),
                            "install_price" : $('.install_price').val(),
                            "description" : $('.description').val(),
                        };
                        momo.sendPost( _body, 'WaterPurifier/addReceive', function( data ){

                            $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态

                            if( !data.errcode ){
                                momo.showTip('保存成功');// 提示内容，并且发送一个事件

                                $(this).removeClass('saveBtn').addClass('editBtn').text('编辑');
                                $('.actually_name').attr( 'readonly', 'true');
                                $('.actually_price').attr( 'readonly', 'true');
                                $('.activity_price').attr( 'readonly', 'true');
                                $('.activity_day').attr( 'readonly', 'true');
                                $('.deliver_name').attr( 'readonly', 'true');
                                $('.deliver_price').attr( 'readonly', 'true');
                                $('.install_name').attr( 'readonly', 'true');
                                $('.install_price').attr( 'readonly', 'true');
                                $('.description').attr( 'readonly', 'true').css( 'background', 'rgb(245,245,245)' );

                            }
                            else alert( data.errmsg );


                        }.bind( this ), function(e){
                            $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                            alert('保存失败！');
                        });
                        break;
                    }

                    case 2 : { // 更换滤芯 tab

                        var _inputData = {
                            "service_name" : $('.service_price_name').val(),
                            "service_price" : $('.service_price_price').val(),
                            "suggest_day" : $('.replace_suggest_day').val(),
                        };
                        saveChangeOrRepairData.call( _self, $('#changeTbody'), _inputData, 'WaterPurifier/addReplace' );
                        break;
                    }

                    case 3 : { // 维修服务 tab

                        var _inputData = {
                            "repair_name" : $('.repair_price_name').val(),
                            "repair_price" : $('.repair_price_price').val(),
                        };
                        saveChangeOrRepairData.call( _self, $('#repairTbody'), _inputData, 'WaterPurifier/addRepair' );
                        break;
                    }
                }

                // 保存 后两个tab的数据
                function saveChangeOrRepairData( $tbody, inputData, url ){

                    var _configs = [];
                    var _trArr = $tbody.children('tr');
                    var _flag = false;// 是否至少有一项是“启用”状态

                    // 判断表格内 配置项数目，至少有一条
                    if( !_trArr.length ){
                        alert('配置项最少保留一个!');
                        $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                        return;
                    }

                    for( var i=0; i < _trArr.length; i++ ){
                        var _temp = {};
                        _temp.name = _trArr.eq(i).find('.name').text();
                        _temp.price = _trArr.eq(i).find('.price').text();
                        _temp.status = _trArr.eq(i).attr('statusAttr');

                        if( _temp.status == '1' ) _flag = true; // 是否至少有一项是“启用”状态
                        _configs.push( _temp );
                    }

                    // 配置项 是否 至少要有一项被启用，否则不能保存
                    if( !_flag ){
                        alert('配置项至少要有一项被启用!');
                        $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                        return;
                    }

                    var _data = $.extend( { "configs": _configs }, inputData );
                    console.log( _data );
                    momo.sendPost( _data, url, function( data ){

                        $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态

                        if( !data.errcode ){
                            //alert('保存成功！');
                            momo.showTip('保存成功');// 提示内容，并且发送一个事件
                        }
                        else alert( data.errmsg );

                    }, function(){
                        $saveBtn.prop( 'disabled', false );// 保存按钮可点击状态
                        alert('保存失败！');
                    });
                }

            });

            // 新建按钮
            $(document).on('click', '.newOne', function(){

                // 根据 当前显示的tab，确定正在编辑的tbody
                var $tbody = ( _self.currentTabIndex == 3 ) ? $('#repairTbody') : $('#changeTbody');

                // 新建记录，上限是10条
                if( $tbody.children('tr').length >= 10 ){
                    alert('新建失败，最多持有10条项目！');
                }else{
                    _self.openAndInitEditModal( $(this), true );
                }
            });

            // 禁用按钮（1是启用）
            $(document).on('click', '.setStatusBtn', function(){
                var _statusAttr = $(this).parents('tr').attr('statusAttr');
                _statusAttr = ( _statusAttr == '1' ? '0' : '1' );// 取反

                $(this).parents('tr').attr('statusAttr', _statusAttr);
                $(this).text( _statusAttr == '1' ? '禁用' : '启用');

                // $('.saveBtn').trigger('click');// 自动保存 模拟 点击保存按钮
            });

            // 删除按钮
            $(document).on('click', '.delBtn', function(){

                var $tbody = $(this).parents('tbody');

                if( confirm('确认删除该配置项？') ){

                    // 执行删除操作（前端）
                    var $tr = $(this).parents('tr'); // 当前要删除的行
                    var $nextTrArr = $tr.nextAll();// 该行后面的 所有行
                    $tr.remove();// 移除该行

                    // 设置该行后面的 所有行 序号（减一）
                    $nextTrArr.each( function(){
                        var _index = parseInt( $(this).find('.num').text() );
                        $(this).find('.num').text( --_index );
                    });

                    _self.setNewOneBtnStyle( _self.currentTabIndex ); // 设置 当前显示tab 的新建按钮样式

                    // 自动保存
                    // $('.saveBtn').trigger('click');// 自动保存 模拟 点击保存按钮

                }
            });

            //（免费领取 tab）编辑按钮
            $(document).on('click', '.editBtn', function(){

                $(this).removeClass('editBtn').addClass('saveBtn').text('保存');
                $('.actually_name').removeAttr( 'readonly' );
                $('.actually_price').removeAttr( 'readonly' );
                $('.activity_price').removeAttr( 'readonly' );
                $('.activity_day').removeAttr( 'readonly' );
                $('.deliver_name').removeAttr( 'readonly' );
                $('.deliver_price').removeAttr( 'readonly' );
                $('.install_name').removeAttr( 'readonly' );
                $('.install_price').removeAttr( 'readonly' );
                $('.description').removeAttr( 'readonly' ).css( 'background', 'rgb(255,255,255)' );
            });

        },

        // 模态框输入 限制
        addInputLimit: function(){

            // 【免费领取tab】
            momo.inputText('.actually_name', 10);// 净水器名称

            momo.inputNum( '.actually_price', 0.01 );// 净水器价格 正数
            momo.inputToFixed2( '.actually_price' );// 净水器价格 保留两位小数

            momo.inputNum( '.activity_price', 0.01 );// 活动价 正数
            momo.inputToFixed2( '.activity_price' );// 活动价 保留两位小数

            momo.inputNum( '.activity_day', 0 );// 活动时间 非负
            momo.inputIntNum( '.activity_day' );// 活动时间 整数

            momo.inputText( '.deliver_name', 10 );// 上门送货费名称
            momo.inputNum( '.deliver_price', 0.01 );// 上门送货费金额 正数
            momo.inputToFixed2( '.deliver_price' );// 上门送货费金额 保留两位小数

            momo.inputText( '.install_name', 10 );// 现场安装费名称
            momo.inputNum( '.install_price', 0.01 );// 现场安装费金额 正数
            momo.inputToFixed2( '.install_price' );// 现场安装费金额 保留两位小数

            momo.inputText( '.description', 100 );// 活动说明


            // 【更换滤芯、维修服务tab】

            // （模态框）表格内部数据 编辑 输入 限制
            momo.inputText( '.editName', 20 );// 项目名称
            momo.inputNum( '.editPrice', 0.01, 99999999.99 );// 金额 范围
            momo.inputToFixed2( '.editPrice' );// 金额（保留两位小数）

            // （模态框）表格上方配置项
            momo.inputText( '.configName', 10 );// 上门服务 / 维修费 名字（放后面，防止被上面的 .editName 覆盖）
            momo.inputNum( '.configPrice', 0.01, 99999999.99 );// 上门服务 / 维修费 金额 范围
            momo.inputNum( '.configDay', 1 );// 上门服务 天数 正数
            momo.inputIntNum( '.configDay' );// 上门服务 天数 整数

        },

        // 设置 当前显示tab 的新建按钮样式
        setNewOneBtnStyle: function( tabIndex ){

            var $newOne = ( tabIndex == 2 ) ? $('.changeNew') : $('.repairNew'); // 当前显示的 新建按钮
            var $tbody = ( tabIndex == 2 ) ? $('#changeTbody') : $('#repairTbody'); // 当前显示的 新建按钮

            //console.log( $tbody.children('tr').length );
            if( $tbody.children('tr').length < 10 ){
                $newOne.removeClass('btn-default').addClass('btn-primary');// 数量 < 10条，新建按钮呈现 蓝色（可用）
            }else{
                $newOne.removeClass('btn-primary').addClass('btn-default');// 数量 >= 10条，新建按钮呈现 灰色（不可用）
            }
        },

    }
})( jQuery );

var init = setting.init.bind( setting );