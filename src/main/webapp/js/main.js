$(function(){
    if ($.fn.datagrid){
        var grid_h = $("#tt").height();//可视区域高度
        var toolbar_h = 28;//Grid工具栏高度
        var pagin_h = 30;//Grid分页工具栏高度
        var title_h = 24;
        var row_h = 27;
        var row_num = Math.floor((grid_h - toolbar_h - pagin_h - title_h) / row_h);//每页显示条数
        var grid_p_list = [row_num, row_num*2, row_num*3, row_num*4];//列表grid每页记录数
        $.fn.datagrid.defaults.height = grid_h;        //长
        $.fn.datagrid.defaults.pageList = grid_p_list;    //分页数列表
        $.fn.datagrid.defaults.pagination = true;        //是否在Grid底部显示分页工具栏
        $.fn.datagrid.defaults.sortOrder = 'desc';        //默认排序规则
        $.fn.datagrid.defaults.collapsible = true;        //Grid是否可收缩
        $.fn.datagrid.defaults.rownumbers = true;        //Grid显示行数
        $.fn.datagrid.defaults.striped = true;            //交替显示行背景
        $.fn.datagrid.defaults.remoteSort = true;        //通过远程服务器对数据排序
        $.fn.datagrid.defaults.fit = true;                //自适应
        $.fn.datagrid.defaults.fitColumns = false;        //自适应宽度
        $.fn.datagrid.defaults.rowStyler = function (index, row) {//行样式
            return 'line-height:16px;';
        };
        $.fn.datagrid.defaults.onBeforeLoad = function (param) {//清除选中项
            $(this).datagrid('clearSelections');
            return true;
        };
    }
    
    var queryObj = {};
    
    var panel = $('#accordion').accordion('getSelected');
    var index = $('#accordion').accordion('getPanelIndex', panel);
    index = parseInt(index) + 1;
    var subsystem_id = $('#id_'+index).val();

    var query_name = $('#query_name').val();
    if(query_name != ""){
        queryObj = {'query_name':query_name, 'subsystem_id':subsystem_id};
    } else {
        queryObj = {'subsystem_id':subsystem_id};
    }

    $('#grid_table').datagrid({
        url:'config/selectServicePage.action',
        sortName: 'time',
        idField:'id',
        pageNumber:1,
        queryParams:queryObj,
        frozenColumns:[[
            {field:'ck',checkbox:true},
            {field:'opt',title:'操作',width:100,align:'center',
                formatter:function(value,rec){
                    var param = rec.subsystem_id + "," + rec.provide_id + "," + rec.client_id;
                    var optBtn =  ' <a href="javascript:lookupService(\''+rec.id+'\',\''+param+'\')" title=\"查看\">查看</a> ';
                        optBtn += ' <a href="javascript:updateService(\''+rec.id+'\',\''+param+'\')" title=\"修改\">修改</a> ';
                    return optBtn;
                }
            }
        ]],
        columns:[[
            {field:'name',title:'名称',width:125,sortable:true,align:'center'},
            {field:'cfg_key',title:'key',width:300,sortable:true,align:'center'},
            {field:'cfg_value',title:'value',width:400,align:'center'},
            {field:'version',title:'版本号',width:75,sortable:true,align:'center'},
            {field:'time',title:'修改时间',width:125,sortable:true,align:'center'},
            {field:'remark',title:'备注',width:125,sortable:true,align:'center'}
        ]],
        toolbar:[ {
            text:'新增',
            iconCls:'icon-add',
            handler:function(){
                openAddConfigWin();
            }
        },'-',{
            text:'删除Service',
            iconCls:'icon-edit',
            handler:function(){
                var ids = [];
                var subArr = [];
                var proArr = [];
                var cliArr = [];
                var rows = $('#grid_table').datagrid('getSelections');
                if (rows.length == 0) {
                    $.messager.alert('提示信息', '请先选中Service！', 'info');
                    return false;
                }
                var row_length = rows.length;
                for(var i=0;i<row_length;i+=1){
                    ids.push(rows[i]['id']);
                    subArr.push(rows[i]['subsystem_id']);
                    proArr.push(rows[i]['provide_id']);
                    cliArr.push(rows[i]['client_id']);
                }
                var id = ids.join(',');
                var subsystem_id = subArr.join(',');
                var provide_id = proArr.join(',');
                var client_id = cliArr.join(',');
                
                $.messager.confirm('是否删除', '是否删除Serice?', function(r) {
                    if (r){
                        $.ajax( {
                            type : "post",
                            url : "config/deleteService",
                            data : {'ids':id, 'subsystem_id':subsystem_id, 'provide_id':provide_id, 'client_id':client_id},
                            complete : function(msg) {
                                $('#grid_table').datagrid({ });
                            }
                        });
                    }
                });
            }
        },'-',{
            text:'修改SubSystem',
            iconCls:'icon-edit',
            handler:function(){
                var panel = $('#accordion').accordion('getSelected');
                if(panel == null){
                    $.messager.alert('提示信息', '请先选中SubSystem！', 'info');
                    return;
                }
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                var subsystem_id = $('#id_'+index).val();
                var title = "修改SubSystem";
                var url = "config/gotoUpdateSubSystem.action?id="+subsystem_id;
                openSpecifiedWindow("default-win",title,url,500,250);
            }
        },'-',{
            text:'删除SubSystem',
            iconCls:'icon-remove',
            handler:function(){
                var panel = $('#accordion').accordion('getSelected');
                if(panel == null){
                    $.messager.alert('提示信息', '请先选中SubSystem！', 'info');
                    return;
                }
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                if($('#tree_'+index).tree("getRoot") != null){
                    $.messager.alert('提示信息', '还有Provide存在,无法删除！', 'info');
                    return;
                }
                var subsystem_id = $('#id_'+index).val();
                $.messager.confirm('是否删除', '是否删除SubSystem?', function(r) {
                    if (r){
                        $.ajax( {
                            type : "post",
                            url : "config/deleteSubSystem",
                            data : {id:subsystem_id},
                            complete : function(msg) {
                                //$('#accordion').accordion('remove', index -1);
                                window.location.reload();
                                $('#grid_table').datagrid({ });
                            }
                        });
                    }
                });
            }
        },'-',{
            text:'修改Provider',
            iconCls:'icon-edit',
            handler:function(){
                var panel = $('#accordion').accordion('getSelected');
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                var node = $('#tree_'+index).tree("getSelected");
                if(node == null){
                    $.messager.alert('提示信息', '请先选中Provide！', 'info');
                    return;
                }
                var text = node.text;
                if(text.indexOf("provide_id") <= -1){
                    $.messager.alert('提示信息', '请先选中Provide！', 'info');
                    return;
                }
                if(text.indexOf("provide_id") > -1){
                    var subsystem_id = $('#id_'+index).val();
                    var id = text.substring(text.indexOf("provide_id_")+11, text.indexOf("_end"));
                    var title = "修改Provide";
                    var url = "config/gotoUpdateProvide.action?id="+id+"&pid="+subsystem_id;
                    openSpecifiedWindow("default-win",title,url,500,250);
                }
            }
        },'-',{
            text:'删除Provider',
            iconCls:'icon-remove',
            handler:function(){
                var panel = $('#accordion').accordion('getSelected');
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                var node = $('#tree_'+index).tree("getSelected");
                if(node == null){
                    $.messager.alert('提示信息', '请先选中Provide！', 'info');
                    return;
                }
                var text = node.text;
                if(text.indexOf("provide_id") <= -1){
                    $.messager.alert('提示信息', '请先选中Provide！', 'info');
                    return;
                }
                if(!$('#tree_'+index).tree("isLeaf", node.target)){
                    $.messager.alert('提示信息', '还有Client存在,无法删除！', 'info');
                    return;
                }
                var text = node.text;
                var subsystem_id = $('#id_'+index).val();
                var id = text.substring(text.indexOf("provide_id_")+11, text.indexOf("_end"));
                $.messager.confirm('是否删除', '是否删除Provide?', function(r) {
                    if (r){
                        $.ajax( {
                            type : "post",
                            url : "config/deleteProvide?pid="+subsystem_id,
                            data : {id:id},
                            complete : function(msg) {
                                window.location.reload();
                                $('#grid_table').datagrid({ });
                            }
                        });
                    }
                });
            }
        },'-',{
            text:'修改Client',
            iconCls:'icon-edit',
            handler:function(){
                var panel = $('#accordion').accordion('getSelected');
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                var node = $('#tree_'+index).tree("getSelected");
                if(node == null){
                    $.messager.alert('提示信息', '请先选中Client！', 'info');
                    return;
                }
                var text = node.text;
                if(text.indexOf("client_id") <= -1){
                    $.messager.alert('提示信息', '请先选中Client！', 'info');
                    return;
                }
                if(text.indexOf("client_id") > -1){
                    var subsystem_id = $('#id_'+index).val();

                    var provideNode = $('#tree_'+index).tree("getParent", node.target);
                    var ptext = provideNode.text;
                    var provide_id = ptext.substring(ptext.indexOf("provide_id_")+11, ptext.indexOf("_end"));

                    var pid = subsystem_id+","+ provide_id;
                    var id = text.substring(text.indexOf("client_id")+10, text.indexOf("_end"));
                    var title = "修改Client";
                    var url = "config/gotoUpdateClient.action?id="+id+"&param="+pid;
                    openSpecifiedWindow("default-win",title,url,500,250);
                }
            }
        },'-',{
            text:'删除Client',
            iconCls:'icon-remove',
            handler:function(){
                var panel = $('#accordion').accordion('getSelected');
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                var node = $('#tree_'+index).tree("getSelected");
                if(node == null){
                    $.messager.alert('提示信息', '请先选中Client！', 'info');
                    return;
                }
                var text = node.text;
                if(text.indexOf("client_id") <= -1){
                    $.messager.alert('提示信息', '请先选中Client！', 'info');
                    return;
                }
                var data = $('#grid_table').datagrid("getRows");
                if(data.length > 0){
                    $.messager.alert('提示信息', '还有Service存在,无法删除！', 'info');
                    return;
                }
                var subsystem_id = $('#id_'+index).val();
                
                var provideNode = $('#tree_'+index).tree("getParent", node.target);
                var ptext = provideNode.text;
                var provide_id = ptext.substring(ptext.indexOf("provide_id_")+11, ptext.indexOf("_end"));
                
                var pid = subsystem_id+","+ provide_id;
                
                var id = text.substring(text.indexOf("client_id_")+10, text.indexOf("_end"));
                $.messager.confirm('是否删除', '是否删除Client?', function(r) {
                    if (r){
                        $.ajax( {
                            type : "post",
                            url : "config/deleteClient?param="+pid,
                            data : {id:id},
                            complete : function(msg) {
                                window.location.reload();
                                $('#grid_table').datagrid({ });
                            }
                        });
                    }
                });
            }
        } ]
    });

});

function updateService(id,param){
    var title = "修改Serice";
    var url = "config/gotoUpdateService.action?id="+id+"&param="+param;
    openSpecifiedWindow("default-win",title,url,500,350);
}

function lookupService(id,param){
    var title = "查看Serice";
    var url = "config/gotoLookupService.action?id="+id+"&param="+param;
    openSpecifiedWindow("default-win",title,url,500,300);    
}

function typeChange(v){
    for(var i=1; i<4; i++){
        $('#tr_'+i)[0].style.display = i<v ? "" : "none";
    }
}

function queryProvide(pid){
    $.ajax( {
        type : "POST",
        url : 'config/selectProvideByPid',
        data : {'pid':pid},
        success : function(msg) {
            var data = eval(msg);
            $("#select_provide").empty();
            $.each(data, function(i,v){
                var id = v.id;
                var name = v.name;
                $("#select_provide").append("<option value='"+id+"'>"+name+"</option>");
                
                var cval = $('#select_provide').val();
                queryClient(cval);
            });
        }
    });
}

function queryProvideAndSelect(pid){
    $.ajax( {
        type : "POST",
        url : 'config/selectProvideByPid',
        data : {'pid':pid},
        success : function(msg) {
            var data = eval(msg);
            $("#select_provide").empty();
            $.each(data, function(i,v){
                var id = v.id;
                var name = v.name;
                $("#select_provide").append("<option value='"+id+"'>"+name+"</option>");
                
                var cval = $('#select_provide').val();
                
                var panel = $('#accordion').accordion('getSelected');
                var index = $('#accordion').accordion('getPanelIndex', panel);
                index = parseInt(index) + 1;
                var node = $('#tree_'+index).tree("getSelected");
                if(node != null){
                    var text = node.text;
                    if(text.indexOf("provide_id") > -1){
                        cval = text.substring(text.indexOf("provide_id_")+11, text.indexOf("_end"));
                    }
                    if(text.indexOf("client_id") > -1){
                        var provideNode = $('#tree_'+index).tree("getParent", node.target);
                        var ptext = provideNode.text;
                        cval = ptext.substring(ptext.indexOf("provide_id_")+11, ptext.indexOf("_end"));
                    }
                    $('#select_provide').val(cval);
                    queryClientAndSelect(cval);
                } else {
                    queryClient(cval);
                }
            });
        }
    });
}

function queryClientAndSelect(pid){
    $.ajax( {
        type : "POST",
        url : 'config/selectClientByPid',
        data : {'pid':pid},
        success : function(msg) {
            var data = eval(msg);
            $("#select_client").empty();
            var flag = true;
            $.each(data, function(i,v){
                var id = v.id;
                var name = v.name;
                //如果是ALL则替换掉缺省的值
                if(name == 'ALL'){
                    $("<option value='"+id+"'>ALL</option>").prependTo("#select_client");
                    flag = false;
                } else {
                    $("#select_client").append("<option value='"+id+"'>"+name+"</option>");
                }
            });
            if(flag){
                $("<option value='0'>ALL</option>").prependTo("#select_client");
            }
            $("#select_client").get(0).selectedIndex=0;
            
            var panel = $('#accordion').accordion('getSelected');
            var index = $('#accordion').accordion('getPanelIndex', panel);
            index = parseInt(index) + 1;
            var node = $('#tree_'+index).tree("getSelected");
            if(node != null){
                var text = node.text;
                if(text.indexOf("client_id") > -1){
                    var id = text.substring(text.indexOf("client_id")+10, text.indexOf("_end"));
                    $('#select_client').val(id);
                }
            }
        }
    });
}

function queryClient(pid){
    $.ajax( {
        type : "POST",
        url : 'config/selectClientByPid',
        data : {'pid':pid},
        success : function(msg) {
            var data = eval(msg);
            $("#select_client").empty();
            var flag = true;
            $.each(data, function(i,v){
                var id = v.id;
                var name = v.name;
                //如果是ALL则替换掉缺省的值
                if(name == 'ALL'){
                    $("<option value='"+id+"'>ALL</option>").prependTo("#select_client");
                    flag = false;
                } else {
                    $("#select_client").append("<option value='"+id+"'>"+name+"</option>");
                }
            });
            if(flag){
                $("<option value='0'>ALL</option>").prependTo("#select_client");
            }
            $("#select_client").get(0).selectedIndex=0;
        }
    });
}

function queryService(col_type,col_id){
    var query_name = $('#query_name').val();
    var queryParams;
    if(col_type == "subsystem_id"){
        queryParams = { "subsystem_id" : col_id,'query_name':query_name };
    } else if (col_type == "provide_id"){
        queryParams = { "provide_id" : col_id ,'query_name':query_name};
    } else {
        queryParams = { "client_id" : col_id,'query_name':query_name };
    }
    $('#grid_table').datagrid({
        queryParams:queryParams,
        pageNumber:1
    });
}

function saveConfig(){
    var subsystemChecked = $('#checkbox1')[0].checked;
    if(!subsystemChecked){
        var subsystem_name=$("#select_subsystem").find("option:selected").text();
        $('#subsystem_name').val(subsystem_name);
    }
    var provideChecked = $('#checkbox2')[0].checked;
    if(!provideChecked){
        var provide_name=$("#select_provide").find("option:selected").text();
        $('#provide_name').val(provide_name);
    }
    var clientChecked = $('#checkbox3')[0].checked;
    if(!clientChecked){
        var client_name=$("#select_client").find("option:selected").text();
        $('#client_name').val(client_name);    
    }
    var clientName = $('#client_name').val();
    if(clientName == ""){
        clientName = "ALL";
    }
    var cfg_key = $('#subsystem_name').val() + "," + $('#provide_name').val() + "," + clientName + "," + $('#service_name').val();
    var subId = !subsystemChecked ? $("#select_subsystem").val() : "";
    var proId = !provideChecked ? $("#select_provide").val() : "";

    if($('#frm_win_add').form('validate')){
        $.ajax( {
            type : "post",
            url : "config/checkKey",
            data : {'service.cfg_key':cfg_key, "subsystemChecked":subsystemChecked, "provideChecked":provideChecked,"clientChecked":clientChecked,"subId":subId,"proId":proId},
            complete : function(msg) {
                var message = msg.responseText;
                if(message == ""){
                    if(clientName == "ALL"){
                        if(!provideChecked){//provider非新增
                            if(clientChecked){//client新增
                                $('#checkbox3')[0].click();
                                $("#select_id option[text='ALL']").attr("selected", true);
                            }
                        }
                    }
                    
                    $('#frm_win_add').form('submit', {
                        url: "config/saveConfig",
                        onSubmit: function(){
                            return $(this).form('validate');
                        },
                        success:function(data){
                            if(!clientChecked){
                                $('#grid_table').datagrid({});
                            } else {
                                window.location.reload();
                            }
                            closeDefaultWindow();
                        }
                    });
                } else {
                    $.messager.alert('提示信息', message, 'info');
                }
            }
        });
    }
}

/**
 * 打开新增配置项的页面
 */
function openAddConfigWin(){
    var title = "新增配置项";
    var url = "config/gotoAddConfigPage.action";
    openSpecifiedWindow("default-win",title,url,600,600);
}

function queryConfig(){
    var query_name = $("#query_name").val();
}

/**
 * 关闭mywindow打开的窗口
 * @return
 */
function closeDefaultWindow(){
    $('#default-win').window('close');
}

/**
 * 打开指定的窗口
 * @param window 弹出窗所渲染的对象ID
 * @param title 弹出窗的标题
 * @param url Action请求路径
 * @param width 弹出窗宽度
 * @param heigth 弹出窗高度
 * @return
 */
function openSpecifiedWindow(window,title,url,width,heigth){
    var s_h = document.body.clientHeight;// 得到屏幕可用区域高度
    var s_i = document.body.clientWidth; // 得到屏幕可用区域宽度
    var d_h = 10;                         // 弹出传弹出后屏幕剩余的高度
    var d_i = 10;                         // 弹出传弹出后屏幕剩余的宽度

    url = encodeURI(url,"utf-8");
    if (url.indexOf("?")>-1) {
        url += "&fresh=" + Math.random();
    } else {
        url += "?fresh=" + Math.random();
    }

    //有自定义宽度且小于屏幕可用宽度时：弹出窗宽度等于自定义宽度，否则等于屏幕可用宽度-50
    width = ( width != null && width != "" && width < s_i ) ? width :  ( s_i - d_i );
    //有自定义高度且小于屏幕可用高度时：弹出窗高度等于自定义高度，否则等于屏幕可用高度-50
    heigth = (heigth != null && heigth != "" && heigth < s_h ) ? heigth : ( s_h - d_h );
    $('#'+window).window({
        title: title,
        left: (s_i - width)/2,
        top: (s_h - heigth)/2,
        width: width,
        height: heigth,
        modal: true,
        cache:false,
        shadow: true,
        minimizable:false,
        maximizable:true,
        closable:true,
        collapsible:true,//可折叠
        closed: false,
        draggable:false,
        resizable:false,
        href: url,
        onOpen:function(){
            $('select').addClass("tntmng_undisplay");
        },
        onClose:function(){
            $('select').removeClass("tntmng_undisplay");
        }
    });
}

/**
 * 关闭指定的窗口
 * @param window 弹出窗所渲染的对象ID
 * @return
 */
function closeSpecifiedWindow(window){
    $('#'+window).window('close');
}