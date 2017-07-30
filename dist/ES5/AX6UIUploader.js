"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jqmin = require("jqmin");

var _jqmin2 = _interopRequireDefault(_jqmin);

var _AX6UICore2 = require("./AX6UICore.js");

var _AX6UICore3 = _interopRequireDefault(_AX6UICore2);

var _AX6Util = require("./AX6Util");

var _AX6Util2 = _interopRequireDefault(_AX6Util);

require("./AX6UIUploader/index.scss");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tmpl = {
  uploadProgress: function uploadProgress(columnKeys) {
    return "";
  },
  inputFile: function inputFile(columnKeys) {
    return "<input type=\"file\" data-ax6ui-uploader-input=\"{{instanceId}}\" name=\"{{name}}\" {{#multiple}}multiple{{/multiple}} accept=\"{{accept}}\" />";
  },
  inputFileForm: function inputFileForm(columnKeys) {
    return "<form data-ax6ui-uploader-form=\"{{instanceId}}\" name=\"ax5uploader-{{instanceId}}-form\" method=\"post\" enctype=\"multipart/form-data\"></form>";
  },
  progressBox: function progressBox(columnKeys) {
    return "\n<div data-ax6ui-uploader-progressbox=\"{{instanceId}}\" class=\"{{theme}}\">\n    <div class=\"ax-progressbox-body\">\n        <div class=\"ax-pregressbox-content\">\n            <div class=\"progress\">\n              <div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" style=\"width: 0\">\n                <span class=\"sr-only\">0% Complete</span>\n              </div>\n            </div>\n        </div>\n        {{#btns}}\n            <div class=\"ax-progressbox-buttons\">\n            {{#btns}}\n                {{#@each}}\n                <button data-pregressbox-btn=\"{{@key}}\" class=\"btn btn-default {{@value.theme}}\">{{@value.label}}</button>\n                {{/@each}}\n            {{/btns}}\n            </div>\n        {{/btns}}\n    </div>\n    <div class=\"ax-progressbox-arrow\"></div>\n</div>\n";
  },
  upoadedBox: function upoadedBox(columnKeys) {
    return "\n{{#uploadedFiles}}<div data-ax6ui-uploader-uploaded-item=\"{{@i}}\">\n    <div class=\"uploaded-item-preview\">\n        {{#" + columnKeys.thumbnail + "}}<img src=\"" + columnKeys.apiServerUrl + "{{" + columnKeys.thumbnail + "}}\">{{/" + columnKeys.thumbnail + "}}\n    </div>\n    <div class=\"uploaded-item-holder\">\n        <div class=\"uploaded-item-cell\" data-uploaded-item-cell=\"download\">{{{icon.download}}}</div>\n        <div class=\"uploaded-item-cell\" data-uploaded-item-cell=\"filename\">{{" + columnKeys.name + "}}</div>\n        <div class=\"uploaded-item-cell\" data-uploaded-item-cell=\"filesize\">({{#@fn_get_byte}}{{" + columnKeys.size + "}}{{/@fn_get_byte}})</div>\n        <div class=\"uploaded-item-cell\" data-uploaded-item-cell=\"delete\">{{{icon.delete}}}</div>\n    </div>\n</div>{{/uploadedFiles}}\n{{^uploadedFiles}}\n{{#supportFileApi}}{{{lang.supportedHTML5_emptyListMsg}}}{{/supportFileApi}}\n{{^supportFileApi}}{{{lang.emptyListMsg}}}{{/supportFileApi}}\n{{/uploadedFiles}}\n";
  }
};

var bound_onStateChanged = function bound_onStateChanged(that) {
  if (this.config.onStateChanged) {
    this.config.onStateChanged.call(that, that);
  } else if (this.onStateChanged) {
    this.onStateChanged.call(that, that);
  }

  that = null;
  return true;
};
var bound_onSelectFile = function bound_onSelectFile(_evt) {
  var files = void 0;

  if (!info.supportFileApi) {
    // file API 지원 안되는 브라우저.
    // input file에 multiple 지원 안됨 그러므로 단일 파일 처리만 하면 됨.
    files = { path: _evt.target.value };
  } else if ('dataTransfer' in _evt) {
    files = _evt.dataTransfer.files;
  } else if ('target' in _evt) {
    files = _evt.target.files;
  } else if (_evt) {
    files = _evt;
  }

  if (!files) return false;

  /// selectedFiles에 현재 파일 정보 담아두기
  if (length in files) {
    if (files.length == 1) {
      this.selectedFiles = [files[0]];
    } else {
      this.selectedFiles = _AX6Util2.default.toArray(files);
    }
  } else {
    this.selectedFiles = [files];
  }

  if (this.config.progressBox) {
    bound_openProgressBox.call(this);
  }
  if (!this.config.manualUpload) {
    this.send();
  }

  if (!info.supportFileApi) {
    bound_alignLayout.call(this, false);
  }
};
var bound_bindEvent = function bound_bindEvent() {
  var _this = this;

  this.$fileSelector.off("click.ax5uploader").on("click.ax5uploader", function (e) {
    _this.$inputFile.trigger("click");
  });

  if (!info.supportFileApi) {
    this.$fileSelector.off("mouseover.ax5uploader").on("mouseover.ax5uploader", function (e) {
      bound_alignLayout.call(_this, true);
    });

    this.$inputFile.off("mouseover.ax5uploader").on("mouseover.ax5uploader", function (e) {
      _this.$fileSelector.addClass("active");
    });

    this.$inputFile.off("mouseout.ax5uploader").on("mouseout.ax5uploader", function (e) {
      _this.$fileSelector.removeClass("active");
      bound_alignLayout.call(_this, false);
    });
  }

  {
    if (!this.$uploadedBox || !this.$uploadedBox.get(0)) return false;

    this.$uploadedBox.on("click", "[data-uploaded-item-cell]", function (e) {
      var $this = (0, _jqmin2.default)(e.currentTarget),
          cellType = $this.attr("data-uploaded-item-cell"),
          uploadedItemIndex = Number($this.parents('[data-ax6ui-uploader-uploaded-item]').attr('data-ax6ui-uploader-uploaded-item')),
          that = {};

      if (_this.config.uploadedBox && _this.config.uploadedBox.onclick) {
        that = {
          self: _this,
          cellType: cellType,
          uploadedFiles: self.uploadedFiles,
          fileIndex: uploadedItemIndex
        };
        _this.config.uploadedBox.onclick.call(that, that);
      }

      $this = null;
      cellType = null;
      uploadedItemIndex = null;
      that = null;
    });

    this.$uploadedBox.on("dragstart", function (e) {
      _AX6Util2.default.stopEvent(e);
      return false;
    });
  }

  {
    // dropZone 설정 방식 변경
    if (!info.supportFileApi) return false;
    if (!this.$dropZone || !this.$dropZone.get(0)) return false;

    var timer = void 0;

    this.$dropZone.parent().on("click", "[data-ax6ui-uploader-dropzone]", function (e) {
      var $target = (0, _jqmin2.default)(e.currentTarget);
      if ($target.parents('[data-ax6ui-uploader-uploaded-item]').length == 0 && !$target.attr('data-ax6ui-uploader-uploaded-item')) {
        if (e.currentTarget == e.target || $.contains(e.currentTarget, e.target)) {
          if (_AX6Util2.default.isFunction(_this.config.dropZone.onclick)) {
            _this.config.dropZone.onclick.call({
              self: _this
            });
          } else {
            _this.$inputFile.trigger("click");
          }
        }
      }
    });

    this.$dropZone.get(0).addEventListener('dragover', function (e) {
      _AX6Util2.default.stopEvent(e);

      if (_AX6Util2.default.isFunction(_this.config.dropZone.ondragover)) {
        _this.config.dropZone.ondragover.call({
          self: _this
        });
      } else {
        _this.$dropZone.addClass("dragover");
      }
    }, false);

    this.$dropZone.get(0).addEventListener('dragleave', function (e) {
      _AX6Util2.default.stopEvent(e);

      if (_AX6Util2.default.isFunction(_this.config.dropZone.ondragover)) {
        _this.config.dropZone.ondragout.call({
          self: _this
        });
      } else {
        _this.$dropZone.removeClass("dragover");
      }
    }, false);

    this.$dropZone.get(0).addEventListener('drop', function (e) {
      _AX6Util2.default.stopEvent(e);

      if (_AX6Util2.default.isFunction(_this.config.dropZone.ondrop)) {
        _this.config.dropZone.ondrop.call({
          self: _this
        });
      } else {
        _this.$dropZone.removeClass("dragover");
      }

      bound_onSelectFile.call(_this, e || window.event);
    }, false);
  }
};
var bound_alignLayout = function bound_alignLayout(_TF) {
  // 상황이 좋지 않은경우 (만약 버튼 클릭으로 input file click이 되지 않는 다면 z-index값을 높여서 버튼위를 덮는다.)
  if (_TF) {
    if (!info.supportFileApi) {
      // ie9에서 inputFile을 직접 클릭하지 않으면 submit 오류발생함. submit access denied
      // 그래서 버튼위에 inputFile을 올려두어야 함. (position값을 이용하면 편하지만..)
      // 그런데 form을 안에두면 또 다른 이중폼 문제 발생소지 ㅜㅜ 불가피하게 버튼의 offset 값을 이용.
      var box = this.$fileSelector.offset();
      box.width = this.$fileSelector.outerWidth();
      box.height = this.$fileSelector.outerHeight();
      this.$inputFile.css(box);
    }
  } else {
    this.$inputFile.css({
      left: -1000, top: -1000
    });
  }
};
var bound_alignProgressBox = function bound_alignProgressBox(append) {
  var _this2 = this;

  var _alignProgressBox = function _alignProgressBox() {
    var $window = (0, _jqmin2.default)(window),
        $body = (0, _jqmin2.default)(document.body);
    var pos = {},
        positionMargin = 6,
        dim = {},
        pickerDim = {},
        pickerDirection = void 0;

    // this.config.viewport.selector

    pos = this.$progressBox.parent().get(0) == this.$target.get(0) ? this.$fileSelector.position() : this.$fileSelector.offset();
    dim = {
      width: this.$fileSelector.outerWidth(),
      height: this.$fileSelector.outerHeight()
    };
    pickerDim = {
      winWidth: Math.max($window.width(), $body.width()),
      winHeight: Math.max($window.height(), $body.height()),
      width: this.$progressBox.outerWidth(),
      height: this.$progressBox.outerHeight()
    };

    // picker css(width, left, top) & direction 결정
    if (!this.config.progressBoxDirection || this.config.progressBoxDirection === "" || this.config.progressBoxDirection === "auto") {
      // set direction
      pickerDirection = "top";
      if (pos.top - pickerDim.height - positionMargin < 0) {
        pickerDirection = "top";
      } else if (pos.top + dim.height + pickerDim.height + positionMargin > pickerDim.winHeight) {
        pickerDirection = "bottom";
      }
    } else {
      pickerDirection = this.config.progressBoxDirection;
    }

    if (append) {
      this.$progressBox.addClass("direction-" + pickerDirection);
    }

    var positionCSS = function () {
      var css = { left: 0, top: 0 };
      switch (pickerDirection) {
        case "top":
          css.left = pos.left + dim.width / 2 - pickerDim.width / 2;
          css.top = pos.top + dim.height + positionMargin;
          break;
        case "bottom":
          css.left = pos.left + dim.width / 2 - pickerDim.width / 2;
          css.top = pos.top - pickerDim.height - positionMargin;
          break;
        case "left":
          css.left = pos.left + dim.width + positionMargin;
          css.top = pos.top - pickerDim.height / 2 + dim.height / 2;
          break;
        case "right":
          css.left = pos.left - pickerDim.width - positionMargin;
          css.top = pos.top - pickerDim.height / 2 + dim.height / 2;
          break;
      }
      return css;
    }();

    {
      if (pickerDirection == "top" || pickerDirection == "bottom") {
        if (positionCSS.left < 0) {
          positionCSS.left = positionMargin;
          this.$progressBoxArrow.css({ left: pos.left + dim.width / 2 - positionCSS.left });
        } else if (positionCSS.left + pickerDim.width > pickerDim.winWidth) {
          positionCSS.left = pickerDim.winWidth - pickerDim.width - positionMargin;
          this.$progressBoxArrow.css({ left: pos.left + dim.width / 2 - positionCSS.left });
        }
      }
    }

    this.$progressBox.css(positionCSS);
  };

  this.$progressBox.css({ top: -999 });

  if (append) {
    // progressBox를 append 할 타겟 엘리먼트 펀단 후 결정.
    (function () {
      if (this.config.viewport) {
        return (0, _jqmin2.default)(this.config.viewport.selector);
      } else {
        return this.$target;
      }
    }).call(this).append(this.$progressBox);

    // progressBox 버튼에 이벤트 연결.
    this.$progressBox.off("click.ax5uploader").on("click.ax5uploader", "button", function (e) {
      var act = e.currentTarget.getAttribute("data-pregressbox-btn");
      var processor = {
        "upload": function upload() {
          this.send();
        },
        "abort": function abort() {
          this.abort();
        }
      };
      if (processor[act]) processor[act].call(_this2);
    });
  }

  setTimeout(function () {
    _alignProgressBox.call(_this2);
  });
};
var bound_openProgressBox = function bound_openProgressBox() {
  this.$progressBox.removeClass("destroy");
  this.$progressUpload.removeAttr("disabled");
  this.$progressAbort.removeAttr("disabled");

  // apend & align progress box
  bound_alignProgressBox.call(this, "append");

  // state change
  bound_onStateChanged.call(this, {
    self: this,
    state: "open"
  });
};
var bound_closeProgressBox = function bound_closeProgressBox() {
  var _this3 = this;

  this.$progressBox.addClass("destroy");
  setTimeout(function () {
    _this3.$progressBox.remove();
  }, this.config.animateTime);
};
var bound_startUpload = function bound_startUpload() {
  var processor = {
    "html5": function html5() {

      var uploadFile = this.selectedFiles.shift();
      if (!uploadFile) {
        // 업로드 종료
        bound_uploadComplete();
        return this;
      }

      if (uploadFile[0]) uploadFile = uploadFile[0];

      var formData = new FormData();
      //서버로 전송해야 할 추가 파라미터 정보 설정

      this.$target.find("input").each(function () {
        formData.append(this.name, this.value);
      });
      // 파일 아이템 추가
      formData.append(this.config.form.fileName, uploadFile);

      this.xhr = new XMLHttpRequest();
      this.xhr.open("post", this.config.form.action, true);
      this.xhr.onload = function (e) {
        var res = e.target.response;
        try {
          if (typeof res == "string") res = _AX6Util2.default.parseJson(res);
        } catch (e) {
          return false;
        }
        if (this.config.debug) console.log(res);

        if (res.error) {
          if (this.config.debug) console.log(res.error);
          if (_AX6Util2.default.isFunction(this.config.onuploaderror)) {
            this.config.onuploaderror.call({
              self: this,
              error: res.error
            }, res);
          }
          self.send();
          return false;
        }

        bound_uploaded(res);
        self.send();
      };
      this.xhr.upload.onprogress = function (e) {
        // console.log(e.loaded, e.total);
        bound_updateProgressBar(e);
        if (_AX6Util2.default.isFunction(this.config.onprogress)) {
          this.config.onprogress.call({
            loaded: e.loaded,
            total: e.total
          }, e);
        }
      };
      this.xhr.send(formData); // multipart/form-data
    },
    "form": function form() {

      /// i'm busy
      this.__uploading = true;

      // 폼과 iframe을 만들어 페이지 아래에 삽입 후 업로드
      var $iframe = (0, _jqmin2.default)('<iframe src="javascript:false;" name="ax5uploader-' + this.instanceId + '-iframe" style="display:none;"></iframe>');
      (0, _jqmin2.default)(document.body).append($iframe);

      // onload 이벤트 핸들러
      // action에서 파일을 받아 처리한 결과값을 텍스트로 출력한다고 가정하고 iframe의 내부 데이터를 결과값으로 callback 호출
      $iframe.load(function () {
        var doc = this.contentWindow ? this.contentWindow.document : this.contentDocument ? this.contentDocument : this.document,
            root = doc.documentElement ? doc.documentElement : doc.body,
            result = root.textContent ? root.textContent : root.innerText,
            res = void 0;

        try {
          res = JSON.parse(result);
        } catch (e) {
          res = {
            error: "Syntax error",
            body: result
          };
        }

        if (this.config.debug) console.log(res);
        if (res.error) {
          console.log(res);
        } else {
          bound_uploaded(res);
          $iframe.remove();

          setTimeout(function () {
            bound_uploadComplete();
          }, 300);
        }
      });

      this.$inputFileForm.attr("target", 'ax5uploader-' + this.instanceId + '-iframe').attr("action", this.config.form.action).submit();

      this.selectedFilesTotal = 1;
      bound_updateProgressBar({
        loaded: 1,
        total: 1
      });
    }
  };

  if (this.__uploading === false) {
    // 전체 파일 사이즈 구하기
    var filesTotal = 0;
    this.selectedFiles.forEach(function (n) {
      filesTotal += n.size;
    });
    this.selectedFilesTotal = filesTotal;
    this.__loaded = 0;

    this.__uploading = true; // 업로드 시작 상태 처리
    this.$progressUpload.attr("disabled", "disabled");
    this.$progressAbort.removeAttr("disabled");
  }

  processor[info.supportFileApi ? "html5" : "form"].call(this);
};
var bound_updateProgressBar = function bound_updateProgressBar(e) {
  this.__loaded += e.loaded;
  this.$progressBar.css({ width: _AX6Util2.default.number(this.__loaded / this.selectedFilesTotal * 100, { round: 2 }) + '%' });
  if (e.lengthComputable) {
    if (e.loaded >= e.total) {}
  }
};
var bound_uploaded = function bound_uploaded(res) {
  if (this.config.debug) console.log(res);
  this.uploadedFiles.push(res);
  bound_repaintUploadedBox(); // 업로드된 파일 출력

  if (_AX6Util2.default.isFunction(this.config.onuploaded)) {
    this.config.onuploaded.call({
      self: this
    }, res);
  }
};
var bound_uploadComplete = function bound_uploadComplete() {
  this.__uploading = false; // 업로드 완료 상태처리
  this.$progressUpload.removeAttr("disabled");
  this.$progressAbort.attr("disabled", "disabled");

  if (this.config.progressBox) {
    bound_closeProgressBox.call(this);
  }
  if (_AX6Util2.default.isFunction(this.config.onuploadComplete)) {
    this.config.onuploadComplete.call({
      self: this
    });
  }
  // update uploadedFiles display

  /// reset inputFile
  bound_attachFileTag.call(this);
};
var bound_cancelUpload = function bound_cancelUpload() {

  var processor = {
    "html5": function html5() {
      if (this.xhr) {
        this.xhr.abort();
      }
    },
    "form": function form() {}
  };

  this.__uploading = false; // 업로드 완료 상태처리
  this.$progressUpload.removeAttr("disabled");
  this.$progressAbort.attr("disabled", "disabled");

  processor[info.supportFileApi ? "html5" : "form"].call(this);

  if (this.config.progressBox) {
    bound_closeProgressBox.call(this);
  }

  //this.$inputFile.val("");
  /// reset inputFile
  bound_attachFileTag.call(this);

  if (this.config.debug) console.log("cancelUpload");
  // update uploadedFiles display
};
var bound_repaintUploadedBox = function bound_repaintUploadedBox() {
  // uploadedBox 가 없다면 아무일도 하지 않음.
  // onuploaded 함수 이벤트를 이용하여 개발자가 직접 업로드디 박스를 구현 한다고 이해 하자.
  if (this.$uploadedBox === null) return this;

  this.$uploadedBox.html(mustache.render(tmpl.upoadedBox.call(this, this.config.uploadedBox.columnKeys), {
    uploadedFiles: this.uploadedFiles,
    icon: this.config.uploadedBox.icon,
    lang: this.config.uploadedBox.lang,
    supportFileApi: !!info.supportFileApi
  }));
  this.$uploadedBox.find("img").on("error", function () {
    //this.src = "";
    $(this).parent().addClass("no-image");
  });
};
var bound_attachFileTag = function bound_attachFileTag() {
  var _this4 = this;

  if (this.$inputFile && this.$inputFile.get(0)) {
    this.$inputFile.remove();
  }
  if (this.$inputFileForm && this.$inputFileForm.get(0)) {
    this.$inputFileForm.remove();
  }

  this.$inputFile = (0, _jqmin2.default)(UPLOADER.tmpl.get.call(this, "inputFile", {
    instanceId: this.instanceId,
    multiple: this.config.multiple,
    accept: this.config.accept,
    name: this.config.form.fileName
  }));

  if (info.supportFileApi) {
    (0, _jqmin2.default)(document.body).append(this.$inputFile);
  } else {
    this.$fileSelector.attr("tabindex", -1);
    this.$inputFileForm = (0, _jqmin2.default)(UPLOADER.tmpl.get.call(this, "inputFileForm", {
      instanceId: this.instanceId
    }));

    this.$inputFileForm.append(this.$inputFile);
    (0, _jqmin2.default)(document.body).append(this.$inputFileForm);
  }

  this.$inputFile.off("change.ax5uploader").on("change.ax5uploader", function (e) {
    bound_onSelectFile.call(_this4, e);
  });
};

/**
 * @class
 */

var AX6UIUploader = function (_AX6UICore) {
  _inherits(AX6UIUploader, _AX6UICore);

  /**
   * @constructor
   * @param config
   */
  function AX6UIUploader(config) {
    _classCallCheck(this, AX6UIUploader);

    /**
     * @member {JSON}
     * @param config
     *
     */
    var _this5 = _possibleConstructorReturn(this, (AX6UIUploader.__proto__ || Object.getPrototypeOf(AX6UIUploader)).call(this));

    _this5.config = {
      clickEventName: "click", //(('ontouchstart' in document.documentElement) ? "touchend" : "click"),
      theme: 'default', // theme of uploader
      lang: { // 업로더 버튼 랭귀지 설정
        "upload": "Upload",
        "abort": "Abort"
      },
      uploadedBox: {
        columnKeys: {
          name: "name",
          type: "type",
          size: "size",
          uploadedName: "uploadedName",
          uploadedPath: "uploadedPath",
          downloadPath: "downloadPath",
          previewPath: "previewPath",
          thumbnail: "thumbnail"
        }
      },
      animateTime: 100,
      accept: "*/*", // 업로드 선택 파일 타입 설정
      multiple: false, // 다중 파일 업로드
      manualUpload: false, // 업로딩 시작 수동처리 여부
      progressBox: true // 업로드 프로그래스 박스 사용여부 false 이면 업로드 진행바를 표시 하지 않습니다. 개발자가 onprogress 함수를 이용하여 직접 구현 해야 합니다.
    };
    _jqmin2.default.extend(true, _this5.config, config);

    // 멤버 변수 초기화
    _this5.defaultBtns = {
      "upload": { label: _this5.config.lang["upload"], theme: "btn-primary" },
      "abort": { label: _this5.config.lang["abort"], theme: _this5.config.theme }
    };

    /// 업로드된 파일 큐
    _this5.uploadedFiles = [];
    /// 업로더 타겟
    _this5.$target = null;
    /// 업로드된 파일 정보들의 input 태그를 담아두는 컨테이너
    _this5.$inputContainer = null;
    /// input file 태그
    _this5.$inputFile = null;
    _this5.$inputFileForm = null;
    /// 파일 선택버튼
    _this5.$fileSelector = null;
    /// 파일 드랍존
    _this5.$dropZone = null;
    /// 파일 목록 표시박스
    _this5.$uploadedBox = null;

    _this5.__uploading = false;
    _this5.selectedFiles = [];
    _this5.selectedFilesTotal = 0;
    _this5.__loaded = 0;

    if (typeof config !== "undefined") _this5.init();
    return _this5;
  }

  /**
   * @method
   */


  _createClass(AX6UIUploader, [{
    key: "init",
    value: function init() {
      this.onStateChanged = this.config.onStateChanged;
      delete this.config.onStateChanged;

      if (this.config.target) {
        this.$target = (0, _jqmin2.default)(this.config.target);

        // 파일 드랍존은 옵션 사항.
        if (this.config.dropZone && this.config.dropZone.target && info.supportFileApi) {
          this.$dropZone = (0, _jqmin2.default)(this.config.dropZone.target);
          this.$dropZone.attr("data-ax6ui-uploader-dropzone", this.instanceId);
        }

        // uploadedBox 옵션 사항
        if (this.config.uploadedBox && this.config.uploadedBox.target) {
          this.$uploadedBox = (0, _jqmin2.default)(this.config.uploadedBox.target);
        }

        // target attribute data
        (function (data) {
          if (_AX6Util2.default.isObject(data) && !data.error) {
            this.config = _jqmin2.default.extend(true, {}, this.config, data);
          }
        }).call(this, _AX6Util2.default.parseJson(this.$target.attr("data-ax6ui-uploader-config"), true));

        // detect element
        /// fileSelector 수집
        this.$fileSelector = this.$target.find('[data-ax6ui-uploader-button="selector"]');
        if (this.$fileSelector.length === 0) {
          console.log(info.getError("ax6ui-uploader", "402", "can not find file selector"));
          return this;
        }

        // input file 추가
        bound_attachFileTag.call(this);

        // btns 확인
        this.config.btns = _jqmin2.default.extend({}, this.defaultBtns, this.config.btns);

        this.$progressBox = (0, _jqmin2.default)(tmpl.progressBox.call(this), {
          instanceId: this.instanceId,
          btns: this.config.btns
        });
        this.$progressBar = this.$progressBox.find('[role="progressbar"]');
        this.$progressBoxArrow = this.$progressBox.find(".ax-progressbox-arrow");
        this.$progressUpload = this.$progressBox.find('[data-pregressbox-btn="upload"]');
        this.$progressAbort = this.$progressBox.find('[data-pregressbox-btn="abort"]');

        // file API가 지원되지 않는 브라우저는 중지 기능 제공 못함.
        if (!info.supportFileApi) {
          this.$progressAbort.hide();
        }
        // 파일버튼 등에 이벤트 연결.
        bound_bindEvent.call(this);

        bound_repaintUploadedBox.call(this);
      }
      // init 호출 여부
      this.initOnce();
    }

    /**
     * @method
     */

  }, {
    key: "initOnce",
    value: function initOnce() {
      if (this.initialized) return this;
      this.initialized = true;
    }

    /**
     * @method
     * @returns {AX6UIUploader}
     *
     */

  }, {
    key: "send",
    value: function send() {
      // 업로드 시작
      if (_AX6Util2.default.isFunction(this.config.validateSelectedFiles)) {
        var that = {
          self: this,
          uploadedFiles: this.uploadedFiles,
          selectedFiles: this.selectedFiles
        };
        if (!this.config.validateSelectedFiles.call(that, that)) {
          bound_cancelUpload.call(this);
          return false;
          // 전송처리 안함.
        }
      }

      bound_startUpload.call(this);
      return this;
    }

    /**
     * @method
     * @returns {AX6UIUploader}
     */

  }, {
    key: "abort",
    value: function abort() {
      if (!info.supportFileApi) {
        alert("This browser not supported abort method");
        return this;
      }
      bound_cancelUpload.call(this);
      return this;
    }

    /**
     * @method
     * @param {Array} _files - JSON formatting can all be overridden in columnKeys.
     * @returns {AX6UIUploader}
     * @example
     * ```js
     * $.ajax({
     *     url: "api/fileListLoad.php",
     *     success: function (res) {
     *         // res JSON format
     *         // [{
     *         // "name": "barcode-scan-ani.gif",
     *         // "saveName": "barcode-scan-ani.gif",
     *         // "type": "file",
     *         // "fileSize": "3891664",
     *         // "uploadedPath": "/ax5ui-uploader/test/api/files",
     *         // "thumbUrl": ""
     *         // }]
     *         upload.setUploadedFiles(res);
     *     }
     * });
     * ```
     */

  }, {
    key: "setUploadedFiles",
    value: function setUploadedFiles(_files) {
      if (_AX6Util2.default.isArray(_files)) {
        this.uploadedFiles = _files;
      }
      if (_AX6Util2.default.isString(_files)) {
        try {
          this.uploadedFiles = JSON.parse(_files);
        } catch (e) {}
      }

      bound_repaintUploadedBox();
      return this;
    }

    /**
     * clear uploadedFiles
     * @method
     * @returns {AX6UIUploader}
     */

  }, {
    key: "clear",
    value: function clear() {
      this.setUploadedFiles([]);
      return this;
    }

    /**
     * Removes the object corresponding to the index passed to the argument from uploadedFiles.
     * @method
     * @param {Number} _index
     * @returns {AX6UIUploader}
     * @example
     * ```js
     * // The actual file is not deleted
     * upload.removeFile(fileIndex);
     * ```
     */

  }, {
    key: "removeFile",
    value: function removeFile(_index) {
      if (!isNaN(Number(_index))) {
        this.uploadedFiles.splice(_index, 1);
      }
      bound_repaintUploadedBox();
      return this;
    }

    /**
     * Empty uploadedFiles
     * @method
     * @returns {AX6UIUploader}
     * @example
     * ```js
     *
     * ```
     */

  }, {
    key: "removeFileAll",
    value: function removeFileAll() {
      this.uploadedFiles = [];
      bound_repaintUploadedBox();
      return this;
    }

    /**
     * @method
     * @returns {Boolean}
     */

  }, {
    key: "selectFile",
    value: function selectFile() {
      if (info.supportFileApi) {
        this.$inputFile.trigger("click");
        return true;
      }
      return false;
    }
  }]);

  return AX6UIUploader;
}(_AX6UICore3.default);

exports.default = AX6UIUploader;