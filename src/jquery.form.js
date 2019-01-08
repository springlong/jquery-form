/**
 * @file        基于jQuery的表单验证插件
 * @author      龙泉 <yangtuan2009@126.com>
 * @version     1.0.0
 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD module
    define(['jquery'], factory);
  } else if (typeof module !== "undefined" && module.exports) {
    // Node/CommonJS
    // Seajs build
    factory(require('jquery'));
  } else {
    // 浏览器全局模式
    factory(jQuery);
  }
})(function($) {

  // 实例对象缓存
  var formCache = {};

  /**
   * 表单验证处理的封装
   * @param  {String|Element|jQuery} selector     表单容器
   * @param  {Object} options 表单验证配置
   * @return {Object}
   */
  function formVisitor(selector, options) {
    return formMiddle(selector, options);
  }

  // 中转函数（不暴露调试模式）
  function formMiddle(selector, options) {
    var formCase = new formCreate(selector, options);
    var isDev = location.protocol === 'file:' || location.host.indexOf('localhost') === 0;

    // 保存缓存
    formCache[selector] = formCase;

    // 如果是本地或者调试模式
    if (isDev || window.localStorage.getItem('formCacheIsDev')) {
      window.formCache = formCache;
    }

    return formCase;
  }

  // 构造函数
  function formCreate(selector, options) {
    // 默认配置
    options = $.extend({
      // 字段验证错误的时候是否停止向下遍历
      // 默认情况下，会根据fields配置列表依次序进行字段验证并输出消息提示。
      // 当该参数为true时，如果碰到某个字段验证失败就会停止后续字段的校验工作。
      stopOnError: false,

      // 错误Icon
      // 为true时，默认使用<i class="msg-errorIcon"></i>，也可自定义html字符串
      // 默认为false，不显示错误Icon
      errorIcon: false,

      // 成功Icon
      // 为true时，默认使用<i class="msg-successIcon"></i>，也可自定义html字符串
      // 默认为false，不显示错误Icon
      successIcon: false,

      // 表单字段失去焦点时进行验证
      // 如果为false，则只在表单提交时进行验证
      // 默认为true
      isBlurCheck: true,

      // 禁用状态的类名设置
      // 当该参数为类名字符串时，点击提交按钮将会判断提交按钮是否含有该禁用状态的类名设置，如果有则不执行提交处理；
      // 该参数需要在isBlurCheck参数为true时方才有效，通常的需求逻辑是，表单字段在失去焦点时进行校验，
      // 当所有校验字段校验成功后，会移除提交按钮的禁用类名，从而让提交按钮恢复可点击状态；
      // 为了实现该参数的功能效果，需要事先在html代码中给提交按钮设置类名；
      // 默认为null，不进行禁用状态的判断
      disabledClass: null,

      // 允许在表单字段缺失的情况通过下验证
      // 默认为false，只有在所有fields配置列表都校验通过后才会提交表单
      allowLost: false,

      // 默认需要触发验证的字段，多个字段使用逗号隔开
      // 个别字段会记住用户名和密码，导致disabled判断异常，需要默认触发一次该类字段的验证
      triggerDefault: null,

      // 默认的错误提示容器
      // 通常在错误提示位置为同一个地方时使用
      // 也可以多个字段的提示位置设置相同的类名，然后在这里统一进行设置，前提是提示位置的容器要与字段元素处于同级关系
      // 在此基础上也可以在fields配置中使用msgBox单独设置某个字段的提示位置，还可以在表单元素中添加data-msgbox属性来进行设置
      // 在fields配置中，允许通过setMsg配置选项来设置是否处理校验提示，如果setMsg为false，则校验规则不会处理校验提示，需要手动通过实例对象的setMsg()函数进行处理
      msgBox: '.j_msg',

      // 消息提示容器的统一类名
      // 用于reset重置时清空错误提示，也用于设置提示内容样式表现
      msgClass: '.msg-box',

      // 字段校验错误时给表单元素添加的类名
      // 默认不添加错误类名
      errorClass: null,

      // 自定义规则设置，比fields配置中使用的默认规则（$.form.rules）的优先级要高
      // 在规则的执行函数中，this关键字指向当前$.form的实例
      // function(val, fieldName){ return val === '验证规则'; }
      // 参数val，字段值
      // 参数fieldName，字段名称
      rules: {},

      // 表单字段的校验配置
      fields: {},

      // 在执行校验成功回调之前触发，如果返回false，将终止valid的回调执行
      beforeValid: null,

      // 点击submit且校验成功时执行的回调
      // callback(data, $submit)，data-表单的字段值，$submit-提交按钮
      valid: null,

      // 提交按钮
      // 默认为表单提交按钮，通过submit事件触发
      // 如果为其他元素则通过click事件触发
      submitBtn: null,

      // 重置按钮
      // 默认为表单重置按钮，通过reset事件触发
      // 如果为其他元素则通过click事件触发
      resetBtn: null,
    }, options);

    var $ele = $(selector), // 表单容器
      options_errorIcon = options.errorIcon,
      options_successIcon = options.successIcon;

    // 错误icon和成功icon的默认赋值
    options.errorIcon = options_errorIcon === true ? '<i class="msg-errorIcon"></i>' : options_errorIcon;
    options.successIcon = options_successIcon === true ? '<i class="msg-successIcon"></i>' : options_successIcon;

    // 将配置选项放到this
    for (var name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }

    // 表单容器
    this.ele = $ele;

    // 检测结果数据缓存
    // 检测成功缓存字段值，否则为false
    this.checkCache = {};

    // 初始化
    this.init();
  }

  // 原型
  formCreate.prototype = {
    /**
     * 初始化
     * @return {undefined}
     */
    init: function() {
      var that = this,
        $ele = that.ele,
        fields = that.fields,
        name;

      // 如果不存在容器元素
      if ($ele.length === 0) return;

      // 遍历字段对象
      for (name in fields) {
        if (fields.hasOwnProperty(name)) {
          // 绑定各表单元素失去焦点时执行的处理
          that.bindEleBlur(name);
        }
      }

      // 绑定表单事件
      that.bindFormEvent();
    },

    /**
     * 绑定各表单元素失去焦点时执行的处理
     * @param  {string} fieldName 字段名称
     * @return {undefined}
     */
    bindEleBlur: function(fieldName) {
      var that = this,
        $ele = that.ele,
        $item = $ele.find('[name="' + fieldName + '"]'),
        val = that.getFieldValue(fieldName);

      // 默认保存字段的值
      that.fields[fieldName].value = val;

      // 如果设置了disabledClass，则需要在默认有值的情况下执行校验
      val !== '' && that.doTriggerDefault(fieldName);

      // 下拉框、单选按钮、复选按钮，需要通过change事件触发
      if ($item.is('select') || $item.is(':radio') || $item.is(':checkbox')) {
        $ele.on('change', '[name="' + fieldName + '"]', function(ev) {
          that.fields[fieldName].value = that.getFieldValue(fieldName);
          that.isBlurCheck && that.checkValid($(this), true); // isBlurCheck为true时，需要执行校验
        });
      } else {
        $ele.on('blur', '[name="' + fieldName + '"]', function(ev) {
          that.fields[fieldName].value = that.getFieldValue(fieldName);
          that.isBlurCheck && that.checkValid($(this), true); // isBlurCheck为true时，需要执行校验
        });
      }
    },

    /**
     * 获取表单字段的值
     * 如果提供单个字段，则返回单个字段的值
     * 否则将返回所有表单字段的数据集合
     * @param  {string|jQuery} fieldName 表单字段的名称，或者表单字段的jQuery对象
     * @return {string|Object}
     */
    getFieldValue: function(fieldName) {
      var that = this,
        $ele = that.ele,
        isJQuery = fieldName instanceof jQuery,
        $items = isJQuery ? fieldName : $ele.find(fieldName ? '[name="' + fieldName + '"]' : '[name]'),
        resultData = {};

      if (isJQuery) {
        fieldName = $items.attr('name');
      }

      $items.each(function(i, ele) {
        var $item = $(ele),
          name = $item.attr('name'),
          value = '';

        // 禁用状态以及novalidate状态不获取值
        if ($item.attr('disabled') !== undefined || $item.attr('novalidate') !== undefined) {
          return;
        }

        // 允许在表单字段丢失的情况下验证通过，则不获取不可见元素的值
        // [type="hidden"]隐藏表单，需要父级容器不可见才不做验证
        if (that.allowLost && $item.is(':hidden') && (!$item.is('[type="hidden"]') || $item.parent().is(':hidden'))) {
          return;
        }

        // 单选框
        if ($item.is('[type="radio"]')) {
          value = $ele.find('[name="' + name + '"]').filter(':checked').val() || '';
        }
        // 复选框
        else if ($item.is('[type="checkbox"]')) {
          value = $item.is(':checked') ? $item.val() : '';
        }
        // 其他输入框
        else {
          value = $item.val() || '';
        }

        resultData[name] = value;
      });

      return fieldName ? (resultData[fieldName] || '') : resultData;
    },

    /**
     * 执行默认验证
     * @param  {string} name 字段名称
     * @return {undefined}
     */
    doTriggerDefault: function(name) {
      var that = this,
        triggerDefault = ',' + that.triggerDefault + ',';

      if (typeof triggerDefault === 'string' && triggerDefault.indexOf(',' + name + ',') !== -1) {
        that.checkValid(name, that.isBlurCheck);
      }
    },

    /**
     * 绑定表单事件
     * @return {undefined}
     */
    bindFormEvent: function() {
      var that = this,
        $ele = that.ele,
        $submitBtn = $ele.find(that.submitBtn || ':submit'),
        $resetBtn = $ele.find(that.resetBtn || ':reset');

      // 全局查找元素
      if ($submitBtn.length === 0 && that.submitBtn !== null) {
        $submitBtn = $(that.submitBtn);
      }

      if ($resetBtn.length === 0 && that.resetBtn !== null) {
        $resetBtn = $(that.resetBtn);
      }

      // 按钮禁用状态
      if (that.disabledClass !== null) {
        $submitBtn.addClass(that.disabledClass);
      }

      // 重置的回调函数
      $ele.on('reset', function(ev) {
        // 错误提示隐藏
        $ele.find(that.msgClass).hide();

        // 清除检测结果数据缓存
        that.checkCache = {};

        // 按钮禁用状态
        if (that.disabledClass !== null) {
          $submitBtn.addClass(that.disabledClass);
        }
      });

      // 提交的回调函数
      $ele.on('submit', function(ev) {
        if (that.valid !== null) {
          ev.preventDefault();
        }

        // 禁止多次点击
        if (that.clickSubmitBtn) return;
        that.clickSubmitBtn = true;

        // 恢复可点击状态
        setTimeout(function() {
          that.clickSubmitBtn = false;
        }, 1000);

        return that.submit();
      });

      // 提交按钮不为表单元素
      if ($submitBtn.length && !$submitBtn.is(':submit')) {
        $submitBtn.on('click', function(ev) {
          ev.preventDefault();
          $ele.trigger('submit');
        });
      }

      // 重置按钮不为表单元素
      if ($resetBtn.length && !$resetBtn.is(':reset')) {
        $resetBtn.on('click', function(ev) {
          ev.preventDefault();
          $ele.trigger('reset');
        });
      }
    },

    /**
     * 执行表单提交 【可供外部使用】
     * 验证失败将返回false
     * @return {undefined}
     */
    submit: function() {
      var that = this,
        $ele = that.ele,
        $submitBtn = $ele.find(that.submitBtn || ':submit'),
        resultData, validResult;

      // 按钮禁用状态不执行后续代码
      if (that.disabledClass !== null && $submitBtn.hasClass(that.disabledClass)) {
        return false;
      }

      // 触发表单全局验证
      resultData = that.checkValid(undefined, false);

      // 附加验证
      if (typeof that.beforeValid === 'function') {
        if (that.beforeValid.call(that, resultData) === false) resultData = false;
      }

      // 验证失败
      if (resultData === false) {
        return false;
      }

      // 验证成功-执行回调函数
      if (typeof that.valid === 'function') {
        validResult = that.valid.call(that, resultData, $submitBtn);
      }

      // 将valid结果返回
      // 只有当validResult的值为undefined和true时才为true，其它均视为false
      return validResult === undefined || validResult === true ? true : false;
    },

    /**
     * 检测有效性
     * @param  {string|jQuery}  name   字段名称|表单字段的jQuery实例
     * @param  {Boolean} byBlur 是否失去焦点
     * @return {undefined}
     */
    checkValid: function(name, byBlur) {
      var that = this,
        $ele = that.ele,
        allValid = true,
        returnResult = true,
        returnFields = {},
        isJQuery = name instanceof jQuery,
        $field = isJQuery ? name : undefined;

      if (isJQuery) {
        name = $field.attr('name');
      }

      // 遍历表单字段
      $.each(that.fields, function(fieldName, curField) {
        var $item, val, isStopOnError, isNeedClear;

        // 如果传递name属性，则仅执行特定元素的规则验证
        // 如果验证结果缓存中已验证正确，则不执行
        if ((name === undefined || name === fieldName)) {
          $item = isJQuery ? $field : $ele.find('[name="' + fieldName + '"]');

          // 如果不存在表单字段
          if ($item.length === 0) {
            // 允许在表单字段丢失的情况下验证通过
            if (that.allowLost) return;

            // 不允许表单字段丢失
            isNeedClear = true;
            $item = $('<input name="' + fieldName + '" value="">');
          }

          // 可能相同name属性的元素有多个
          // 依次验证判断
          $item.each(function() {
            var $thisItem = $(this),
              checkResult;

            val = that.getFieldValue($thisItem);

            // 如果表单元素为禁用，或者添加了novalidate属性，则不进行校验
            if ($thisItem.attr('disabled') !== undefined || $thisItem.attr('novalidate') !== undefined) {
              return;
            }

            // 允许在表单字段丢失的情况下验证通过
            if (that.allowLost && $thisItem.is(':hidden') && (!$thisItem.is('[type="hidden"]') || $thisItem.parent().is(':hidden'))) {
              return;
            }

            // 执行校验
            checkResult = that.fieldValid(fieldName, val);

            // 校验结果为undefined，也表示成功
            if (checkResult === undefined) {
              checkResult = true;
            }

            // 缓存验证结果
            // 校验失败缓存false值，校验成功缓存字段值
            that.checkCache[fieldName] = checkResult === true ? val : false;

            // 校验错误，显示错误提示
            if (checkResult !== true) {
              curField.setMsg !== false && that.setMsg($thisItem, checkResult, byBlur);
              returnResult = false;
            }
            // 校验成功，保存字段数据，并隐藏错误提示
            else {
              returnFields[fieldName] = val;
              curField.setMsg !== false && that.setMsg($thisItem, '', byBlur);
              // 如果单个验证，且该字段被其他字段匹配，则需要触发其他字段的校验
              if (name !== undefined && curField.beMatched !== undefined) {
                that.getFieldValue(curField.beMatched) && that.checkValid(curField.beMatched, that.isBlurCheck);
              }
            }

            // 执行各字段的回调函数
            checkResult === true && typeof curField.valid === 'function' && curField.valid.call(that, val, $thisItem);
            checkResult !== true && typeof curField.invalid === 'function' && curField.invalid.call(that, checkResult, $thisItem);

            // 碰到错误停止遍历
            if (checkResult !== true && that.stopOnError) {
              isStopOnError = true;
              return false;
            }
          });

          // 附加辅助元素需要清理
          if (isNeedClear) {
            $item.remove();
          }

          // 碰到错误停止遍历
          if (isStopOnError === true) return false;
        }
      });

      // 再次遍历表单字段，用于判断所有规则是否验证成功
      if (that.disabledClass !== null) {
        $.each(that.fields, function(fieldName, curField) {
          if (that.checkCache[fieldName] === false || that.checkCache[fieldName] === undefined) {
            allValid = false;
            return false;
          }
        });

        $ele.find(that.submitBtn || ':submit').toggleClass(that.disabledClass, !allValid);
      }

      // 验证失败返回false，验证成功返回验证字段的数据集合
      return returnResult === false ? false : (name === undefined ? that.getFieldValue() : returnFields);
    },

    /**
     * 设置某个字段的错误提示 【可供外部使用】
     * @param {string|jQuery} fieldName 字段名称|类名|表单字段的jQuery实例
     * @param {string} msg  提示内容，不填写或者为''表示成功提示，有效字符串表示错误提示
     * @param {Boolean} byBlur 是否为失去焦点触发的错误提示
     */
    setMsg: function(fieldName, msg, byBlur) {
      var that = this,
        $ele = that.ele,
        isJQuery = fieldName instanceof jQuery,
        $item = isJQuery ? fieldName : $ele.find('[name="' + fieldName + '"]'),
        checkRight = msg === '' || msg === undefined || msg === true,
        curField, msgBox, $msg, timerSetMsg, msgState, canCoverMsg = true;

      if (isJQuery) {
        fieldName = $item.attr('name');
      }

      curField = that.fields[fieldName] || {};
      msgBox = curField.msgBox || $item.attr('data-msgbox');

      // 如果是类名或者id
      if (fieldName[0] === '.' || fieldName[0] === '#') {
        $msg = $ele.find(fieldName);
      } else {
        if (msgBox === undefined) {
          $msg = $ele.find(that.msgBox);
          // 如果存在多个相同类名的提示框，则取当前字段最近的一个
          if ($msg.length > 1) {
            $msg = $item.parent().find(that.msgBox);
          }
        } else {
          $msg = $ele.find(msgBox);
        }

        // 手动执行setMsg函数会对checkCache进行赋值
        if (byBlur === undefined) {
          that.checkCache[fieldName] = checkRight ? that.getFieldValue($item) : false;
        }

        // 当通过点击【提交】按钮触发时
        // 在$msg元素为多个字段的共同错误提示元素时，如果$msg元素记录了其他字段的错误信息，则不进行错误提示的覆盖
        if (byBlur === false && that.stopOnError === false) {
          msgState = $msg.data('msgState');

          // 如果$msg元素记录了其它字段的错误信息，则不进行错误提示覆盖
          if (typeof msgState === 'string' && msgState !== fieldName) {
            canCoverMsg = false;
          }

          // 记录当前错误字段
          if (!checkRight) {
            $msg.data('msgState', fieldName);
          }
        } else {
          // 通过焦点事件触发时，移除msgState记录，确保不影响【提交】按钮时的触发逻辑
          $msg.removeData('msgState');
        }
      }

      if (canCoverMsg) {
        timerSetMsg = $msg.data('timerSetMsg');
        clearTimeout(timerSetMsg);
      }

      if (!checkRight) {
        $item.addClass(that.errorClass);
        if (canCoverMsg) {
          timerSetMsg = setTimeout(function() {
            $msg.html(that.errorIcon !== false ? that.errorIcon + msg : msg).show();
          }, 100);
        }
      } else {
        if (that.successIcon !== false) {
          $item.removeClass(that.errorClass);
          if (canCoverMsg) {
            timerSetMsg = setTimeout(function() {
              $msg.html(that.successIcon).show();
            }, 100);
          }
        } else {
          $item.removeClass(that.errorClass);
          if (canCoverMsg) {
            // 错误提示信息的隐藏，可能导致布局高度调整，从而不会触发确认按钮的点击事件，通过延时得以解决
            timerSetMsg = setTimeout(function() {
              $msg.html('').hide();
            }, 100);
          }
        }
      }
      $msg.data('timerSetMsg', timerSetMsg);
    },

    /**
     * 检测单个字段的有效性，有效则返回true，否则返回错误提示
     * @param  {string} fieldName 字段名称
     * @param  {string} val 字段值
     * @return {string|Boolean}
     */
    fieldValid: function(fieldName, val) {
      var that = this,
        rules = that.fields[fieldName].rules,
        ruleName, ruleMsg, args, checkFun, tempCheck;

      for (name in rules) {
        if (Object.prototype.hasOwnProperty.call(rules, name)) {
          ruleName = name.replace(/\(.*\)/, '');
          ruleMsg = rules[name];

          // 带括号的需要分离以逗号隔开的参数部分
          args = name.indexOf('(') > 0 ? name.replace(ruleName, '').replace('(', '').replace(')', '').split(',') : [];

          // 字段值作为首个参数
          args.unshift(val);

          // 回调函数校验
          if (typeof ruleMsg === 'function') {
            tempCheck = ruleMsg.call(that, val);
            // 校验失败返回错误提示
            if (tempCheck !== true) {
              return tempCheck;
            }
          }
          // 已有规则校验
          else {
            // 检测函数，默认从自身的rules中查找，再从formVisitor.rules中查找
            checkFun = that.rules[ruleName] || formVisitor.rules[ruleName] || null;
            if (typeof checkFun === 'function') {
              tempCheck = checkFun.apply(that, args);
              // 校验失败返回错误提示
              if (tempCheck === false) {
                return ruleMsg;
              }
            }
          }
        }
      }

      return true;
    },
  };

  // 触发指定表单的提交行为
  formVisitor.submit = function(selector) {
    var objCache = formCache[selector];
    if (objCache !== undefined) {
      return objCache.submit();
    }
  };

  // 设置某个字段的错误提示
  formVisitor.setMsg = function(selector, fieldName, msg) {
    var objCache = formCache[selector];
    if (objCache !== undefined) {
      return objCache.setMsg(fieldName, msg);
    }
  };

  // 验证规则配置
  formVisitor.rules = {
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
  };

  // 使用$.form调用
  $.form = formVisitor;
});