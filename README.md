# jQuery form

基于jQuery的表单验证插件

由于示例文件需要模拟ajax请求，为了更好的查看示例文件，我们提供了node server配置，安装好node依赖后执行 `node server.js` 即可。

## JS使用示例

```js
// 绑定表单验证
// 默认可用规则，请参见$.form.rules对象
var formBox = $.form('#formBox', {
  // 字段验证失败的时候是否停止向下遍历
  // 默认情况下，会根据fields配置列表依次序进行字段验证并输出消息提示。
  // 当该参数为true时，如果碰到某个字段验证失败就会停止后续字段的校验工作。
  stopOnError: false,

  // 错误Icon
  // 为true时，默认使用<i class="msg-errorIcon"></i>，也可自定义html字符串
  // 默认为false，不显示错误Icon
  errorIcon: true,

  // 成功Icon
  // 为true时，默认使用<i class="msg-successIcon"></i>，也可自定义html字符串
  // 默认为false，不显示错误Icon
  successIcon: true,

  // 表单字段失去焦点时进行验证
  // 如果为false，则只在表单提交时进行验证
  // 默认为true
  isBlurCheck: true,

  // 禁用状态的类名设置
  // 当该参数为类名字符串时，点击提交按钮将会判断提交按钮是否含有该禁用状态的类名设置，如果有则不执行提交处理；
  // 该参数需要在isBlurCheck参数为true时方才有效，通常的需求逻辑是，表单字段在失去焦点时进行校验，
  // 当所有校验字段校验成功后，会移除提交按钮的禁用类名，从而让提交按钮恢复可点击状态；
  // 默认为null，不进行禁用状态的判断
  disabledClass: null,

  // 允许在表单字段缺失的情况通过下验证
  // 默认为false，只有在所有fields配置列表都校验通过后才会提交表单
  allowLost: false,

  // 默认的错误提示容器
  // 通常在错误提示位置为同一个地方时使用
  // 也可以多个字段的提示位置设置相同的类名，然后在这里统一进行设置，前提是提示位置的容器要与字段元素处于同级关系
  // 在此基础上也可以在fields配置中使用msgBox单独设置某个字段的提示位置，还可以在表单元素中添加data-msgbox属性来进行设置
  // 在fields配置中，允许通过setMsg配置选项来设置是否处理校验提示，如果setMsg为false，则校验规则不会处理校验提示，需要手动通过实例对象的setMsg()函数进行处理
  msgBox: '.j_msg',

  // 消息提示容器的统一类名
  // 用于reset重置时清空错误提示，也用于设置提示内容样式表现
  msgClass: '.msg-box',

  // 字段校验错误时给表单字段添加的类名
  // 默认不添加错误类名
  errorClass: null,

  // 自定义规则设置，比fields配置中使用的默认规则（$.form.rules）的优先级要高
  // 在规则的执行函数中，this关键字指向当前$.form的实例
  // function(val, fieldName){ return val === '验证规则'; }
  // 参数val，字段值
  // 参数fieldName，字段名称
  rules: {
    // 验证字母
    'letter': function(val, fieldName) {
      return /^[a-z]+$/.test(val);
    }
  },

  // 表单字段
  fields: {
    // 当前密码
    'oldPassword': {
      // 校验规则
      rules: {
        'required': '请填写当前密码',
        'letter': '必须是字母',
        'length(6)': '请填写至少6个字符',
        'length(,20)': '请填写不超过20个字符',
        'mustHaveLetterA': function(value, callback) {
          // 通过回调函数自定义校验规则，name名称不限制
          if (value.indexOf('a') === -1) {
            // 校验错误返回错误提示
            return '没有包含字母a';
          }
          // 校验正确返货true或undefined
          return true;
        },
        'ajaxValid': function(value, callback) {
          // 通过回调函数自定义校验规则，name名称不限制
          var result = false;

          $.ajax({
            type: 'POST',
            url: 'page/check.html',
            // 字段校验通过ajax必须同步请求
            async: false,
            data: {
              oldPassword: value,
            },
            success: function(res) {
              result = true;
            },
            fail: function(res){
              result = 'error';
            }
          });

          return result;
        },
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 验证有效，执行的回调
      // value-字段值
      // $item-字段元素
      valid: function(value, $item) {
        // do something ...
        console.log('oldPassword-验证成功:' + value);
      },
      // 验证无效，执行的回调
      // msg-错误提示
      // $item-字段元素
      invalid: function(msg, $item) {
        // do something ...
        console.log('oldPassword-验证失败:' + msg);
      },
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      msgBox: '.j_msgOld',
    },

    // 新密码
    'newPassword': {
      // 校验规则
      rules: {
        'required': '请设置登录密码',
        'length(6,20)': '密码为6-20位字符，可由字母、数字或标点符号组成'
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      // msgBox: '.j_msgNew',
    },

    // 确认密码
    'repPassword': {
      // 校验规则
      rules: {
        'required': '请再次输入密码',
        'length(6,20)': '请填写6到20个字符',
        'match(newPassword)': '两次填写的密码不一致'
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      msgBox: '.j_msgRep',
    },

    // 性别
    'sex': {
      // 校验规则
      rules: {
        'required': '请选择性别'
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      msgBox: '.j_msgSex',
    },

    // 填写昵称
    'needUserName': {
      // 校验规则
      rules: {
        'required': '请选择是否填写昵称'
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      msgBox: '.j_msgNeedUserName',
      // 验证有效，执行的回调
      // value-字段值
      // $item-字段元素
      valid: function(value, $item) {
        // 通过 novalidate 属性的控制让用户昵称在需要填写时才进行输入验证
        if (value === '1') {
          $('.j_userNameBox').show().find('input').removeAttr('novalidate');
        } else {
          $('.j_userNameBox').hide().find('input').attr('novalidate', 'novalidate');
        }
      },
    },

    // 用户昵称
    'username': {
      // 校验规则
      rules: {
        'required': '请输入用户昵称'
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      msgBox: '.j_msgName',
    },

    // 类目
    'classify': {
      // 校验规则
      rules: {
        'required': '请选择类目'
      },
      // 是否处理校验提示，默认为true
      setMsg: true,
      // 错误提示框，缺省将优先使用元素的data-msgbox属性，再着使用一级配置下的msgBox
      msgBox: '.j_msgClassify',
    }
  },

  // 校验成功回调函数
  // data-表单字段
  // $submit-提交按钮
  valid: function(data, $submit) {
    $.ajax({
      type: 'POST',
      url: 'page/check.html',
      data: data,
      success: function(res) {
        alert('表单提交成功!');
        location.reload();
      },
      fail: function(res){
        if(res.code === -11105) {
          formBox.setMsg('oldPassword', '你填写的密码和原密码不一致');
        } else {
          alert('表单提交失败!');
        }
      }
    });
  },

  // 在执行校验成功回调之前触发，如果返回false，将终止valid的回调执行
  // data参数-校验字段校验成功表示表单字段值的集合，否则为false
  beforeValid: function(data) {
    console.log('beforeValid:', data)
    return checkFavoChoosed();
  },

  // 提交按钮
  // 默认为表单提交按钮 ':submit'
  submitBtn: '.j_pwdSubmit',

  // 重置按钮
  // 默认为表单重置按钮 ':reset'
  resetBtn: '.j_pwdReset',
});

// 爱好选择三个以上，移除错误提示
$('.j_FavoChooseBox').on('change', function() {
  checkFavoChoosed();
});

/**
 * 检测爱好的选择情况
 * @return {Boolean|undefined}
 */
function checkFavoChoosed() {
  // 爱好必须选择三个以上
  if ($('.j_FavoChooseBox').find(':checked').length < 3) {
    formBox.setMsg('.j_msgFavo', '爱好必须选择三个以上');
    return false;
  }
  formBox.setMsg('.j_msgFavo');
}
```

## $.form.rules 提供的配置规则

```js
{
  // ip地址
  'ip': function(val) {
    return /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/.test(val);
  },
  // 网页Url
  'url': function(val) {
    return /^(http|https):\/\/([\w-]+\.)+[\w-]+.*?$/.test(val);
  },
  // 日期字符串，支持：2017-1-2、2017/1/2、2017-01-02、2017/01/02
  'date': function(val) {
    return /^\d{4}-\d{1,2}-\d{1,2}$/.test(val) || /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(val);
  },
  // 手机号码
  'mobile': function(val) {
    return /^1\d{10}$/.test(val);
  },
  // 电话号码
  'phone': function(val) {
    return /^(?:(?:0\d{2,3}[\- ]?[1-9]\d{6,7})|(?:[48]00[\- ]?[1-9]\d{6}))$/.test(val);
  },
  // 不能为空
  'required': function(val) {
    return !/^\s*$/.test(val);
  },
  // 身份证号码
  'IDcard': function(val) {
    return /^\d{6}(19|2\d)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)?$/.test(val);
  },
  // 中文
  'chinese': function(val) {
    return /^[\u0391-\uFFE5]+$/.test(val);
  },
  // 邮箱
  'email': function(val) {
    return /^[\w\+\-]+(\.[\w\+\-]+)*@[a-z\d\-]+(\.[a-z\d\-]+)*\.([a-z]{2,4})$/i.test(val);
  },
  // QQ
  'qq': function(val) {
    return /^[1-9]\d{4,}$/.test(val);
  },
  // 邮政编码
  'zipcode': function(val) {
    return /^\d{6}$/.test(val);
  },
  // 数字
  'digits': function(val) {
    return /^\d+$/.test(val);
  },
  // 字母
  'letters': function(val) {
    return /^[a-z]+$/i.test(val);
  },
  // 字符长度
  'length': function(val, min, max) {
    var len = (val + '').length;
    if (max !== undefined) {
      return len <= max && len >= min;
    } else {
      return len >= min;
    }
  },
  // 字节长度
  'byteLength': function(val, min, max) {
    var len = (val + '').replace(/[^\x00-\xff]/ig, '**').length;
    if (max !== undefined) {
      return len <= max && len >= min;
    } else {
      return len >= min;
    }
  },
  // 与对应字段匹配
  'match': function(val, matchField) {
    return this.getFieldValue(matchField) === val;
  }
}
```