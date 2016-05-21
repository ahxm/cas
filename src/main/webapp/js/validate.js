$.extend($.fn.validatebox.defaults.rules, {
    loginName : {
        validator : function(value, param) {
            return (/^[\u0391-\uFFE5\w]+$/.test(value)) && (value.length >= 3)
                    && (value.length <= 20);
        },
        message : '请输入3-20位的字母、数字、下划线。'
    },
    safepass : {
        validator : function(value, param) {
            return (value.length >= 3) && (value.length <= 10);
        },
        message : '请输入3-10位长度的密码'
    },
    equalTo : {
        validator : function(value, param) {
            return value == $('#' + param[0]).val();
        },
        message : '两次输入的内容不一至'
    },
    noSpecial : {
        validator : function(value, param) {
            return !((value.indexOf(" ") > -1) || (value.indexOf(".") > -1) || (value.indexOf("=") > -1));
        },
        message : '"."、空格和"="为关键词，不能输入'
    }
});