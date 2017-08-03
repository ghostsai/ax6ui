import jQuery from "jqmin";
import AX6UICore from "./AX6UICore.js";
import info from "./AX6Info";
import U from "./AX6Util";
import mustache from "./AX6Mustache";

/** ~~~~~~~~~~~~~~~~~~ end of import  ~~~~~~~~~~~~~~~~~~~~ **/

let ctrlKeys = {
  "18": "KEY_ALT",
  //"8": "KEY_BACKSPACE",
  "17": "KEY_CONTROL",
  "46": "KEY_DELETE",
  "40": "KEY_DOWN",
  "35": "KEY_END",
  "187": "KEY_EQUAL",
  //"27": "KEY_ESC",
  "36": "KEY_HOME",
  "45": "KEY_INSERT",
  "37": "KEY_LEFT",
  "189": "KEY_MINUS",
  "34": "KEY_PAGEDOWN",
  "33": "KEY_PAGEUP",
  // "190": "KEY_PERIOD",
  //"13": "KEY_RETURN",
  "39": "KEY_RIGHT",
  "16": "KEY_SHIFT",
  // "32": "KEY_SPACE",
  "9": "KEY_TAB",
  "38": "KEY_UP",
  "91": "KEY_WINDOW"
  //"107" : "NUMPAD_ADD",
  //"194" : "NUMPAD_COMMA",
  //"110" : "NUMPAD_DECIMAL",
  //"111" : "NUMPAD_DIVIDE",
  //"12" : "NUMPAD_EQUAL",
  //"106" : "NUMPAD_MULTIPLY",
  //"109" : "NUMPAD_SUBTRACT"
};
let tmpl = {
  "optionGroup"(columnKeys) {
    return `
<div class="ax6ui-autocomplete-option-group {{theme}} {{size}}" data-ax6ui-autocomplete-option-group="{{id}}">
    <div class="ax-autocomplete-body">
        <div class="ax-autocomplete-option-group-content" data-els="content"></div>
    </div>
    <div class="ax-autocomplete-arrow"></div> 
</div>
`;
  },
  "autocompleteDisplay"(columnKeys) {
    return ` 
<input tabindex="-1" type="text" data-input-dummy="" style="display: none;" />
<div class="ax6ui-autocomplete-display {{theme}}" data-ax6ui-autocomplete-display="{{id}}" data-ax6ui-autocomplete-instance="{{instanceId}}" style="height: {{height}}px;">
    <div class="ax6ui-autocomplete-display-table" data-els="display-table">
        <div data-ax6ui-autocomplete-display="label-holder"> 
          <a {{^tabIndex}}{{/tabIndex}}{{#tabIndex}}tabindex="{{tabIndex}}" {{/tabIndex}} data-ax6ui-autocomplete-display="label" spellcheck="false">
              <input type="text" data-ax6ui-autocomplete-display="input" style="border:0 none;height: {{height}}px;" />
          </a>
        </div>
        <div data-ax6ui-autocomplete-display="addon"> 
            {{#multiple}}{{#reset}}
            <span class="addon-icon-reset" data-selected-clear="true">{{{.}}}</span>
            {{/reset}}{{/multiple}}
        </div>
    </div>
</div>
`;
  },
  "formSelect"(columnKeys) {
    return `
<select tabindex="-1" class="form-control {{formSize}}" name="{{name}}" multiple="multiple"></select>
`;
  },
  "formSelectOptions"(columnKeys) {
    return `
{{#selected}}
<option value="{{${columnKeys.optionValue}}}" selected="true">{{${columnKeys.optionText}}}</option>
{{/selected}}
`;
  },
  "options"(columnKeys) {
    return `
{{#waitOptions}}
    <div class="ax-autocomplete-option-item">
            <div class="ax-autocomplete-option-item-holder">
                <span class="ax-autocomplete-option-item-cell ax-autocomplete-option-item-label">
                    {{{lang.loading}}}
                </span>
            </div>
        </div>
{{/waitOptions}}
{{^waitOptions}}
    {{#options}}
        {{^hide}}
        <div class="ax-autocomplete-option-item" data-option-focus-index="{{@findex}}" data-option-index="{{@index}}" data-option-value="{{${columnKeys.optionValue}}}" {{#${columnKeys.optionSelected}}}data-option-selected="true"{{/${columnKeys.optionSelected}}}>
            <div class="ax-autocomplete-option-item-holder">
                <span class="ax-autocomplete-option-item-cell ax-autocomplete-option-item-label">{{${columnKeys.optionText}}}</span>
            </div>
        </div>
        {{/hide}}
    {{/options}}
    {{^options}}
        <div class="ax-autocomplete-option-item">
            <div class="ax-autocomplete-option-item-holder">
                <span class="ax-autocomplete-option-item-cell ax-autocomplete-option-item-label">
                    {{{lang.noOptions}}}
                </span>
            </div>
        </div>
    {{/options}}
{{/waitOptions}}
`;
  },
  "label"(columnKeys) {
    return `{{#selected}}
<div tabindex="-1" data-ax6ui-autocomplete-selected-label="{{@i}}" data-ax6ui-autocomplete-selected-text="{{text}}">
<div data-ax6ui-autocomplete-remove="true" data-ax6ui-autocomplete-remove-index="{{@i}}">{{{removeIcon}}}</div>
<span>{{${columnKeys.optionText}}}</span>
</div>{{/selected}}`;
  },
};

const onStateChanged = function (item, that) {
  if (item && item.onStateChanged) {
    item.onStateChanged.call(that, that);
  }
  else if (this.onStateChanged) {
    this.onStateChanged.call(that, that);
  }

  if (that.state == "changeValue") {
    if (item && item.onChange) {
      item.onChange.call(that, that);
    }
    else if (this.onChange) {
      this.onChange.call(that, that);
    }
  }

  item = null;
  that = null;
  return true;
};
const alignAutocompleteDisplay = function () {
  let i = this.queue.length, w;

  while (i--) {
    let item = this.queue[i];
    if (item.$display) {
      w = Math.max(item.$select.outerWidth(), U.number(item.minWidth));
      item.$display.css({
        "min-width": w
      });
      if (item.reset) {
        item.$display.find(".addon-icon-reset").css({
          "line-height": this.queue[i].$display.height() + "px"
        });
      }

      // 높이조절 처리
      if (item.multiple) {
        var displayTableHeightAdjust = (function () {
          return U.number(item.$display.css("border-top-width")) + U.number(item.$display.css("border-bottom-width"));
        }).call(this);
        item.$target.height('');
        item.$display.height('');

        var displayTableHeight = item.$displayTable.outerHeight();
        if (Math.abs(displayTableHeight - item.$target.height()) > displayTableHeightAdjust) {
          item.$target.css({height: displayTableHeight + displayTableHeightAdjust + 4});
          item.$display.css({height: displayTableHeight + displayTableHeightAdjust + 4});
        }
      }
    }
  }

  i = null;
  w = null;
  return this;
};
const alignAutocompleteOptionGroup = function (append) {
  if (append && !this.activeautocompleteOptionGroup) return this;

  let item = this.queue[this.activeautocompleteQueueIndex],
    pos = {}, positionMargin = 0,
    dim = {}, pickerDim = {},
    pickerDirection;

  if (!item) return this;
  if (append) jQuery(document.body).append(this.activeautocompleteOptionGroup);

  pos = item.$target.offset();
  dim = {
    width: item.$target.outerWidth(),
    height: item.$target.outerHeight()
  };
  pickerDim = {
    winWidth: Math.max($(window).width(), jQuery(document.body).width()),
    winHeight: Math.max($(window).height(), jQuery(document.body).height()),
    width: this.activeautocompleteOptionGroup.outerWidth(),
    height: this.activeautocompleteOptionGroup.outerHeight()
  };

  // picker css(width, left, top) & direction 결정
  if (!item.direction || item.direction === "" || item.direction === "auto") {
    // set direction
    pickerDirection = "top";

    if (pos.top - pickerDim.height - positionMargin < 0) {
      pickerDirection = "top";
    } else if (pos.top + dim.height + pickerDim.height + positionMargin > pickerDim.winHeight) {
      pickerDirection = "bottom";
    }
  } else {
    pickerDirection = item.direction;
  }

  if (append) {
    this.activeautocompleteOptionGroup
      .addClass("direction-" + pickerDirection);
  }
  this.activeautocompleteOptionGroup
    .css((function () {
      if (pickerDirection == "top") {
        if (pos.top + dim.height + pickerDim.height + positionMargin > pickerDim.winHeight) {

          var newTop = pos.top + pickerDim.height;
          if (newTop + pickerDim.height + positionMargin > pickerDim.winHeight) {
            newTop = 0;
          }
          if (newTop < 0) {
            newTop = 0;
          }

          return {
            left: pos.left,
            top: newTop,
            width: dim.width
          }
        }
        return {
          left: pos.left,
          top: pos.top + dim.height + 1,
          width: dim.width
        }
      }
      else if (pickerDirection == "bottom") {
        return {
          left: pos.left,
          top: pos.top - pickerDim.height - 1,
          width: dim.width
        }
      }
    }).call(this));
};
const onBodyClick = function (e, target) {
  if (!this.activeautocompleteOptionGroup) return this;

  let item = this.queue[this.activeautocompleteQueueIndex], clickEl = "display";

  target = U.findParentNode(e.target, function (target) {
    if (target.getAttribute("data-option-value")) {
      clickEl = "optionItem";
      return true;
    }
    else if (item.$target.get(0) == target) {
      clickEl = "display";
      return true;
    }
  });

  if (!target) {
    this.close();
    return this;
  }
  else if (clickEl === "optionItem") {
    setSelected.call(this, item.id, {
      optionIndex: {
        index: target.getAttribute("data-option-index")
      }
    }, undefined, "optionItemClick");
    alignAutocompleteDisplay.call(this);
    alignAutocompleteOptionGroup.call(this);
    if (!item.multiple) {
      this.close();
    }
  }
  else {

  }

  return this;
};
const getLabel = function (queIdx) {
  let item = this.queue[queIdx];

  // 템플릿에 전달 해야할 데이터 선언
  let data = {};
  data.id = item.id;
  data.theme = item.theme;
  data.multiple = item.multiple;
  data.lang = item.lang;
  data.options = item.options;
  data.selected = item.selected;
  data.hasSelected = (data.selected && data.selected.length > 0);
  data.removeIcon = item.removeIcon;

  return mustache.render(tmpl.label.call(this, item.columnKeys), data);
};
const syncLabel = function (queIdx) {
  let item = this.queue[queIdx];

  if (!item.multiple && item.selected && item.selected.length > 0) {
    item.selected = [].concat(item.selected[item.selected.length - 1]);
  }

  item.selected.forEach(function (n, nindex) {
    n["@index"] = nindex;
  });

  item.$select.html(
    mustache.render(tmpl.formSelectOptions.call(this, item.columnKeys), {
      selected: item.selected
    })
  );
};
const printLabel = function (queIdx) {
  let item = this.queue[queIdx];

  item.$displayLabel.find('[data-ax6ui-autocomplete-selected-label]').remove();
  item.$displayLabelInput.before(getLabel.call(this, queIdx));
};
const focusLabel = function (queIdx) {
  if (this.queue[queIdx].disabled) return this;

  this.queue[queIdx].$displayLabel.trigger("focus");
  this.queue[queIdx].$displayLabelInput.focus();
};
const clearLabel = function (queIdx) {
  this.queue[queIdx].$displayLabelInput.val('');
};
const blurLabel = function (queIdx) {
  this.queue[queIdx].$displayLabel.trigger("blur");
};
const onSearch = function (queIdx, searchWord) {
  if (this.activeautocompleteQueueIndex == -1) return this; // 옵션박스가 닫힌상태이면 진행안함.
  let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
  searchWord = searchWord.replace(regExp, "");

  this.queue[queIdx].waitOptions = true;
  this.queue[queIdx].onSearch.call({
    self: this,
    item: this.queue[queIdx],
    searchWord: searchWord
  }, (function (O) {

    let data = {};
    let item = this.queue[this.activeautocompleteQueueIndex];
    if (!item) return false;

    /// 현재 selected 검증후 처리
    (function (item, O) {
      let optionsMap = {};
      O.options.forEach(function (_O, _OIndex) {
        _O["@index"] = _OIndex;
        _O["@findex"] = _OIndex;
        optionsMap[_O[item.columnKeys.optionValue]] = _O;
      });
      if (U.isArray(item.selected)) {
        item.selected.forEach(function (_O) {
          if (optionsMap[_O[item.columnKeys.optionValue]]) {
            O.options[optionsMap[_O[item.columnKeys.optionValue]]["@index"]][item.columnKeys.optionSelected] = true;
          }
        });
      }
    })(item, O);

    item.options = O.options;

    alignAutocompleteDisplay.call(this);

    /// 템플릿에 전달할 오브젝트 선언
    data.id = item.id;
    data.theme = item.theme;
    data.multiple = item.multiple;
    data.lang = item.lang;
    data.options = item.options;
    this.activeautocompleteOptionGroup.find('[data-els="content"]').html(mustache.render(tmpl.options.call(this, item.columnKeys), data));

    focusWord.call(this, this.activeautocompleteQueueIndex, searchWord);
    alignAutocompleteOptionGroup.call(this);

    setTimeout((function () {
      alignAutocompleteOptionGroup.call(this);
    }).bind(this));


  }).bind(this));
};
const focusWord = function (queIdx, searchWord) {
  if (this.activeautocompleteQueueIndex == -1) return this; // 옵션박스가 닫힌상태이면 진행안함.
  let collect_options = [], i = -1, l = this.queue[queIdx].options.length - 1, n;
  if (searchWord != "") {
    while (l - i++) {
      n = this.queue[queIdx].options[i];

      if (('' + n.text).toLowerCase() == searchWord.toLowerCase()) {
        collect_options = [{'@findex': n['@findex'], optionsSort: 0}];
        break;
      } else {
        let sort = ('' + n.text).toLowerCase().search(searchWord.toLowerCase());
        if (sort > -1) {
          collect_options.push({'@findex': n['@findex'], optionsSort: sort});
          if (collect_options.length > 2) break;
        }
        sort = null;
      }
    }
    collect_options.sort(function (a, b) {
      return a.optionsSort - b.optionsSort;
    });
  }

  if (collect_options && collect_options.length > 0) {
    focusMove.call(this, queIdx, undefined, collect_options[0]['@findex']);
  } else {
    focusClear.call(this, queIdx);
  }
};
const focusClear = function (queIdx) {
  if (this.activeautocompleteOptionGroup) {
    this.activeautocompleteOptionGroup
      .find('[data-option-focus-index]')
      .removeClass("hover")
      .removeAttr("data-option-selected");
  }

  this.queue[queIdx].optionFocusIndex = -1;
};
const focusMove = function (queIdx, direction, findex) {
  let _focusIndex, _prevFocusIndex, focusOptionEl, optionGroupScrollContainer;
  let item = this.queue[queIdx];

  if (this.activeautocompleteOptionGroup && item.options && item.options.length > 0) {

    if (typeof findex !== "undefined") {
      _focusIndex = findex
    }
    else {
      _prevFocusIndex = (item.optionFocusIndex == -1) ? item.optionSelectedIndex || -1 : item.optionFocusIndex;
      if (_prevFocusIndex == -1) {
        _focusIndex = 0;
        //_focusIndex = (direction > 0) ? 0 : item.optionItemLength - 1; // 맨 끝으로 보낼것인가 말 것인가.
      }
      else {
        _focusIndex = _prevFocusIndex + direction;
        if (_focusIndex < 0) _focusIndex = 0;
        else if (_focusIndex > item.optionItemLength - 1) _focusIndex = item.optionItemLength - 1;
      }
    }

    item.optionFocusIndex = _focusIndex;

    // 포커스 인덱스가 hide아이템을 만나면 hide 아이템이 안나올 때까지 루프를 순회 합니다.
    if (item.options[_focusIndex] && item.options[_focusIndex].hide) { // 옵션이 없는 값이 선택된 경우
      if (typeof direction === "undefined") {
        return this;
      }
      else {
        let isStrop = false;
        while (item.options[_focusIndex].hide) {
          _focusIndex = _focusIndex + direction;
          if (_focusIndex < 0) {
            _focusIndex = 0;
            break;
          }
          else if (_focusIndex > item.optionItemLength - 1) {
            _focusIndex = item.optionItemLength - 1;
            break;
          }
        }
      }
    }

    if (typeof _focusIndex !== "undefined") {
      this.activeautocompleteOptionGroup
        .find('[data-option-focus-index]')
        .removeClass("hover");

      focusOptionEl = this.activeautocompleteOptionGroup
        .find('[data-option-focus-index="' + _focusIndex + '"]')
        .addClass("hover");

      optionGroupScrollContainer = this.activeautocompleteOptionGroup.find('[data-els="content"]');

      if (focusOptionEl.get(0)) {
        let focusOptionElHeight = focusOptionEl.outerHeight(),
          optionGroupScrollContainerHeight = optionGroupScrollContainer.innerHeight(),
          optionGroupScrollContainerScrollTop = optionGroupScrollContainer.scrollTop(),
          focusOptionElTop = focusOptionEl.position().top + optionGroupScrollContainer.scrollTop();

        if (optionGroupScrollContainerHeight + optionGroupScrollContainerScrollTop < focusOptionElTop + focusOptionElHeight) {
          optionGroupScrollContainer.scrollTop(focusOptionElTop + focusOptionElHeight - optionGroupScrollContainerHeight);
        }
        else if (optionGroupScrollContainerScrollTop > focusOptionElTop) {
          optionGroupScrollContainer.scrollTop(focusOptionElTop);
        }
        // optionGroup scroll check

        if (typeof direction !== "undefined") {
          item.$displayLabelInput.val(item.options[_focusIndex].text);
        }
      }
    }
  }
};
const bindAutocompleteTarget = function (queIdx) {

  const debouncedFocusWord = U.debounce(function (queIdx) {
    if (this.activeautocompleteQueueIndex == -1) return this; // 옵션박스가 닫힌상태이면 진행안함.
    onSearch.call(this, queIdx, this.queue[queIdx].$displayLabelInput.val());
  }, 100).bind(this);
  const autocompleteEvent = {
    'click': function (queIdx, e) {
      var clickEl;
      var target = U.findParentNode(e.target, function (target) {
        if (target.getAttribute("data-ax6ui-autocomplete-remove")) {
          clickEl = "optionItemRemove";
          return true;
        }
        else if (target.getAttribute("data-selected-clear")) {
          clickEl = "clear";
          return true;
        }
      });

      if (target) {
        if (clickEl === "optionItemRemove") {
          var removeIndex = target.getAttribute("data-ax6ui-autocomplete-remove-index");
          this.queue[queIdx].selected.splice(removeIndex, 1);
          syncLabel.call(this, queIdx);
          printLabel.call(this, queIdx);
          focusLabel.call(this, queIdx);
          alignAutocompleteDisplay.call(this);
          alignAutocompleteOptionGroup.call(this);
          U.stopEvent(e);
          return this;
        } else if (clickEl === "clear") {
          setSelected.call(this, queIdx, {clear: true});
          alignAutocompleteDisplay.call(this);
          alignAutocompleteOptionGroup.call(this);
        }
      }
      else {
        if (this.activeautocompleteQueueIndex == queIdx) {
          if (this.queue[queIdx].optionFocusIndex == -1) { // 아이템에 포커스가 활성화 된 후, 마우스 이벤트 이면 무시
            this.close();
          }
        }
        else {
          focusLabel.call(this, queIdx);
        }
      }
    },
    'keyUp': function (queIdx, e) {
      /// 약속된 키 이벤트가 발생하면 stopEvent를 통해 keyUp 이벤트가 발생되지 않도록 막아주는 센스
      if (e.which == info.eventKeys.ESC && this.activeautocompleteQueueIndex === -1) { // ESC키를 누르고 옵션그룹이 열려있지 않은 경우
        U.stopEvent(e);
        return this;
      }
      if (e.which == info.eventKeys.TAB) {
        // nothing

        this.close();
        return this;
      }
      if (this.activeautocompleteQueueIndex != queIdx) { // 닫힌 상태 인경우
        this.open(queIdx); // open and align
      }
      if (ctrlKeys[e.which]) {
        U.stopEvent(e);
      }
      else {
        // backspace 감지 하여 input 값이 없으면 스탑이벤트 처리 할 것
        if (e.which == info.eventKeys.BACKSPACE && this.queue[queIdx].$displayLabelInput.val() == "") {
          // 마지막 아이템을 제거.
          this.queue[queIdx].selected.pop();
          syncLabel.call(this, queIdx);
          printLabel.call(this, queIdx);
          focusLabel.call(this, queIdx);
          alignAutocompleteDisplay.call(this);
          alignAutocompleteOptionGroup.call(this);
          U.stopEvent(e);
        } else {
          debouncedFocusWord(queIdx);

        }
      }
    },
    'keyDown': function (queIdx, e) {
      if (e.which == info.eventKeys.ESC) {
        clearLabel.call(this, queIdx);
        this.close();
        U.stopEvent(e);
      }
      else if (e.which == info.eventKeys.RETURN) {
        var inputValue = this.queue[queIdx].$displayLabelInput.val();
        if (item.optionFocusIndex > -1) {
          setSelected.call(this, item.id, {
            optionIndex: {
              index: item.optionFocusIndex
            }
          }, undefined, "optionItemClick");
        } else if (inputValue != "") {
          setSelected.call(this, queIdx, inputValue, true);
        }
        clearLabel.call(this, queIdx);
        alignAutocompleteDisplay.call(this);
        this.close();

        U.stopEvent(e);
      }
      else if (e.which == info.eventKeys.DOWN) {
        focusMove.call(this, queIdx, 1);
        U.stopEvent(e);
      }
      else if (e.which == info.eventKeys.UP) {
        focusMove.call(this, queIdx, -1);
        U.stopEvent(e);
      }
    },
    'focus': function (queIdx, e) {
      // console.log(e);

    },
    'blur': function (queIdx, e) {
      blurLabel.call(this, queIdx);
      U.stopEvent(e);
    },
    'selectChange': function (queIdx, e) {
      setSelected.call(this, queIdx, {value: this.queue[queIdx].$select.val()}, true);
    }
  };
  const blurLabel = function (queIdx) {
    clearLabel.call(this, queIdx);
  };

  let item = this.queue[queIdx], data = {};

  if (!item.$display) {
    /// 템플릿에 전달할 오브젝트 선언
    data.instanceId = this.instanceId;
    data.id = item.id;
    data.name = item.name;
    data.theme = item.theme;
    data.tabIndex = item.tabIndex;
    data.multiple = item.multiple;
    data.reset = item.reset;
    data.height = item.height;
    data.label = getLabel.call(this, queIdx);

    item.$display = jQuery(mustache.render(tmpl.autocompleteDisplay.call(this, item.columnKeys), data));
    item.$displayTable = item.$display.find('[data-els="display-table"]');
    item.$displayLabel = item.$display.find('[data-ax6ui-autocomplete-display="label"]');
    item.$displayLabelInput = item.$display.find('[data-ax6ui-autocomplete-display="input"]');

    if (item.$target.find("select").get(0)) {
      item.$select = item.$target.find("select");
      item.$select
        .attr("tabindex", "-1")
        .attr("class", "form-control " + data.formSize);

      if (data.name) {
        item.$select.attr("name", "name");
      }
      item.$select.attr("multiple", "multiple");
    }
    else {
      item.$select = jQuery(mustache.render(tmpl.formSelect.call(this, item.columnKeys), data));
      item.$target.append(item.$select);
    }

    item.$target.append(item.$display);

  }
  else {
    printLabel.call(this, queIdx);
  }

  alignAutocompleteDisplay.call(this);


  item.$display
    .off('click.ax6ui-autocomplete')
    .on('click.ax6ui-autocomplete', autocompleteEvent.click.bind(this, queIdx));

  // autocomplete 태그에 대한 이벤트 감시

  item.$displayLabelInput
    .off("focus.ax6ui-autocomplete")
    .on("focus.ax6ui-autocomplete", autocompleteEvent.focus.bind(this, queIdx))
    .off("blur.ax6ui-autocomplete")
    .on("blur.ax6ui-autocomplete", autocompleteEvent.blur.bind(this, queIdx))
    .off("keydown.ax6ui-autocomplete")
    .on("keydown.ax6ui-autocomplete", autocompleteEvent.keyDown.bind(this, queIdx))
    .off("keyup.ax6ui-autocomplete")
    .on("keyup.ax6ui-autocomplete", autocompleteEvent.keyUp.bind(this, queIdx));

  // select 태그에 대한 change 이벤트 감시

  /*
    item.$select
      .off('change.ax6ui-autocomplete')
      .on('change.ax6ui-autocomplete', autocompleteEvent.selectChange.bind(this, queIdx));
    */

  data = null;
  item = null;
  queIdx = null;
  return this;
};
const getQueIdx = function (boundID) {
  if (boundID instanceof jQuery) {
    boundID = boundID.data("data-ax6ui-autocomplete-id");
  } else if (!U.isString(boundID)) {
    boundID = jQuery(boundID).data("data-ax6ui-autocomplete-id");
  }
  if (!U.isString(boundID)) {
    console.log(info.getError("ax6ui-autocomplete", "402", "getQueIdx"));
    return;
  }
  return U.search(this.queue, function () {
    return this.id == boundID;
  });
};
const getSelected = function (_item, o, selected) {
  if (typeof selected === "undefined") {
    return (_item.multiple) ? !o : true;
  } else {
    return selected;
  }
};
const clearSelected = function (queIdx) {
  this.queue[queIdx].options.forEach(function (n) {
    if (n.optgroup) {
      n.options.forEach(function (nn) {
        nn.selected = false;
      });
    }
    else {
      n.selected = false;
    }
  });

  this.queue[queIdx].selected = [];
  this.queue[queIdx].$select.html(
    mustache.render(tmpl.formSelectOptions.call(this, this.queue[queIdx].columnKeys), {
      selected: this.queue[queIdx].selected
    })
  );
};
const setSelected = function (boundID, value, selected, _option) {
  const processor = {
    'selectedIndex': function (queIdx, value, selected, setValueType) {

    },
    'removeSelectedIndex': function (queIdx, value, selected, setValueType) {
      var item = this.queue[queIdx], addOptions = {};
      var newSelectedArray = [], optionIndex = 0;
      for (var i = 0; i < item.selected.length; i++) {
        if (item.selected[i]['@index'] != value.removeSelectedIndex.index) {
          addOptions = {'@index': optionIndex, '@findex': optionIndex};
          addOptions[item.columnKeys.optionValue] = item.selected[i][item.columnKeys.optionValue];
          addOptions[item.columnKeys.optionText] = item.selected[i][item.columnKeys.optionText];
          newSelectedArray.push(addOptions);
          optionIndex++;
        }
      }
      item.selected = newSelectedArray;
    },
    'optionIndex': function (queIdx, value, selected, setValueType) {
      var item = this.queue[queIdx], addOptions = {};
      var optionIndex = item.selected.length;
      var pushOk = true;

      addOptions = {
        '@index': optionIndex, '@findex': optionIndex
      };
      addOptions[item.columnKeys.optionValue] = item.options[value.optionIndex.index][item.columnKeys.optionValue];
      addOptions[item.columnKeys.optionText] = item.options[value.optionIndex.index][item.columnKeys.optionText];

      for (var i = 0; i < item.selected.length; i++) {
        if (item.selected[i][item.columnKeys.optionValue] == addOptions[item.columnKeys.optionValue]) {
          pushOk = false;
        }
      }
      if (pushOk) item.selected.push(addOptions);
    },
    'arr': function (queIdx, values, selected, setValueType) {
      values.forEach(function (value) {
        if (U.isString(value) || U.isNumber(value)) {
          processor.text.call(self, queIdx, value, selected, "justSetValue");
        }
        else {
          for (var key in processor) {
            if (value[key]) {
              processor[key].call(self, queIdx, value, selected, "justSetValue");
              break;
            }
          }
        }
      });
    },
    'value': function (queIdx, value, selected, setValueType) {
      var item = this.queue[queIdx];
      var addOptions;
      var optionIndex = U.search(item.options, function () {
        return this[item.columnKeys.optionValue] == value.value[item.columnKeys.optionValue];
      });

      if (optionIndex > -1) {
        item.options[optionIndex][item.columnKeys.optionSelected]
          = getSelected(item, item.options[optionIndex][item.columnKeys.optionSelected], selected);

        if (item.options[optionIndex][item.columnKeys.optionSelected]) {
          var appendOk = true;
          for (var i = 0; i < item.selected.length; i++) {
            if (item.selected[i][this.config.columnKeys.optionValue] == item.options[optionIndex][this.config.columnKeys.optionValue]) {
              appendOk = false;
              break;
            }
          }
          if (appendOk) {
            addOptions = {};
            addOptions[item.columnKeys.optionValue] = item.options[optionIndex][item.columnKeys.optionValue];
            addOptions[item.columnKeys.optionText] = item.options[optionIndex][item.columnKeys.optionText];
            item.selected.push(addOptions);
          }
        }
        else {
          var newSelectedArray = [];
          for (var i = 0; i < item.selected.length; i++) {
            if (item.selected[i][this.config.columnKeys.optionValue] == item.options[optionIndex][this.config.columnKeys.optionValue]) {

            }
            else {
              addOptions = {};
              addOptions[item.columnKeys.optionValue] = item.selected[i][item.columnKeys.optionValue];
              addOptions[item.columnKeys.optionText] = item.selected[i][item.columnKeys.optionText];
              newSelectedArray.push(addOptions);
            }
          }
          item.selected = newSelectedArray;
        }

      }
      else {
        // 새로운 값 추가
        var appendOk = true;
        for (var i = 0; i < item.selected.length; i++) {
          if (item.selected[i][this.config.columnKeys.optionValue] == value.value[this.config.columnKeys.optionValue]) {
            appendOk = false;
            break;
          }
        }

        if (appendOk) {
          addOptions = {};
          addOptions[item.columnKeys.optionValue] = value.value[this.config.columnKeys.optionValue];
          addOptions[item.columnKeys.optionText] = value.value[this.config.columnKeys.optionText];
          item.selected.push(addOptions);
        }
      }
    },
    'text': function (queIdx, value, selected, setValueType) {
      var item = this.queue[queIdx];
      var addOptions;
      var optionIndex = U.search(item.options, function () {
        return this[item.columnKeys.optionText] == value;
      });

      if (optionIndex > -1) {
        item.options[optionIndex][item.columnKeys.optionSelected]
          = getSelected(item, item.options[optionIndex][item.columnKeys.optionSelected], selected);

        if (item.options[optionIndex][item.columnKeys.optionSelected]) {
          var appendOk = true;
          for (var i = 0; i < item.selected.length; i++) {
            if (item.selected[i][this.config.columnKeys.optionText] == item.options[optionIndex][this.config.columnKeys.optionText]) {
              appendOk = false;
              break;
            }
          }
          if (appendOk) {
            addOptions = {};
            addOptions[item.columnKeys.optionValue] = item.options[optionIndex][item.columnKeys.optionValue];
            addOptions[item.columnKeys.optionText] = item.options[optionIndex][item.columnKeys.optionText];
            item.selected.push(addOptions);
          }
        }
        else {
          var newSelectedArray = [];
          for (var i = 0; i < item.selected.length; i++) {
            if (item.selected[i][this.config.columnKeys.optionText] == item.options[optionIndex][this.config.columnKeys.optionText]) {

            }
            else {
              addOptions = {};
              addOptions[item.columnKeys.optionValue] = item.selected[i][item.columnKeys.optionValue];
              addOptions[item.columnKeys.optionText] = item.selected[i][item.columnKeys.optionText];
              newSelectedArray.push(addOptions);
            }
          }
          item.selected = newSelectedArray;
        }
      }
      else {
        // 새로운 값 추가
        var appendOk = true;
        for (var i = 0; i < item.selected.length; i++) {
          if (item.selected[i][this.config.columnKeys.optionText] == value) {
            appendOk = false;
            break;
          }
        }

        if (appendOk) {
          addOptions = {};
          addOptions[item.columnKeys.optionValue] = value;
          addOptions[item.columnKeys.optionText] = value;
          item.selected.push(addOptions);
        }
      }
    },
    'clear': function (queIdx) {
      clearSelected.call(this, queIdx);
      focusClear.call(this, queIdx);

      if (this.activeautocompleteOptionGroup) {
        this.activeautocompleteOptionGroup
          .find('[data-option-index]')
          .attr("data-option-Selected", "false");
      }
      this.queue[queIdx].optionSelectedIndex = -1;
    }
  };

  let queIdx = (U.isNumber(boundID)) ? boundID : getQueIdx.call(this, boundID);
  if (queIdx === -1) {
    console.log(info.getError("ax6ui-autocomplete", "402", "val"));
    return;
  }

  if (typeof value == "undefined") {
    throw "error not found value";
  }
  else if (U.isArray(value)) {
    processor.clear.call(this, queIdx);
    processor.arr.call(this, queIdx, (this.queue[queIdx].multiple || value.length == 0) ? value : [value[value.length - 1]], selected);
  }
  else if (U.isString(value) || U.isNumber(value)) {
    if (typeof value !== "undefined" && value !== null && !this.queue[queIdx].multiple) {
      clearSelected.call(this, queIdx);
    }
    processor.text.call(this, queIdx, value, selected);
  }
  else {
    if (value === null) {
      processor.clear.call(this, queIdx);
    }
    else {
      if (!this.queue[queIdx].multiple) {
        clearSelected.call(this, queIdx);
      }
      for (var key in processor) {
        if (value[key]) {
          processor[key].call(this, queIdx, value, selected);
          break;
        }
      }
    }
  }

  syncLabel.call(this, queIdx);
  printLabel.call(this, queIdx);
  focusLabel.call(this, queIdx);
  alignAutocompleteOptionGroup.call(this);

  if (typeof value !== "undefined") {
    if (_option && !_option.noStateChange) {
      onStateChanged.call(this, this.queue[queIdx], {
        self: this,
        item: this.queue[queIdx],
        state: "changeValue",
        value: this.queue[queIdx].selected
      });
    }
  }

  boundID = null;
  return this;
};

/** ~~~~~~~~~~~~~~~~~~ end of private  ~~~~~~~~~~~~~~~~~~~~ **/

/**
 * @class
 */
class AX6UIAutocomplete extends AX6UICore {
  /**
   * @constructor
   * @param config
   */
  constructor(config) {
    super();

    /**
     * @member {JSON}
     * @param config
     * @param [config.theme='default']
     * @param [config.animateTime=250]
     * @param [config.height=34]
     * @param [config.lang] - 메세지들
     * @param [config.lang.noSelected='']
     * @param [config.lang.noOptions='no options']
     * @param [config.lang.loading='now loading..']
     * @param [config.columnKeys] - 내부에서 사용 JSON key 정의
     * @param [config.columnKeys.optionValue='value']
     * @param [config.columnKeys.optionText='text']
     * @param [config.columnKeys.optionSelected='selected']
     */
    this.config = {
      theme: 'default',
      animateTime: 250,
      height: 34,
      removeIcon: 'U+00d7',
      lang: {
        noSelected: '',
        noOptions: 'no options',
        loading: 'Now Processing'
      },
      columnKeys: {
        optionValue: 'value',
        optionText: 'text',
        optionSelected: 'selected'
      }
    };
    jQuery.extend(true, this.config, config);

    // 멤버 변수 초기화
    /**
     * bind를 통해 연결된 select가 저장되는 변수
     * @member {Array}
     */
    this.queue = [];
    /**
     * @member {Object}
     */
    this.activeautocompleteOptionGroup = null;
    /**
     * @member {Number}
     */
    this.activeautocompleteQueueIndex = -1;
    /**
     * @member {Object}
     */
    this.openTimer = null;
    /**
     * @member {Object}
     */
    this.closeTimer = null;
    /**
     * @member {Function}
     */
    this.waitOptionsCallback = null;
    /**
     * @member {Object}
     */
    this.keyUpTimer = null;
    /**
     * @member {Object}
     */
    this.xvar = {};

    this.init();
  }

  /**
   * @method
   * @param config
   */
  init() {
    this.onStateChanged = this.config.onStateChanged;
    delete this.config.onStateChanged;
    this.onChange = this.config.onChange;
    delete this.config.onChange;

    // init 호출 여부
    this.initOnce();
  }

  /**
   * @method
   */
  initOnce() {
    if (this.initialized) return this;
    this.initialized = true;

    // throttledResize
    $(window).on("resize.ax6ui-autocomplete-display-" + this.instanceId, U.throttle(function (e) {
      alignAutocompleteDisplay.call(this, e || window.event);
      alignAutocompleteOptionGroup.call(this);
    }, 100).bind(this));
  }

  /**
   * bind autocomplete
   * @method
   * @param {Object} item
   * @param {String} [item.id]
   * @param {String} [item.theme]
   * @param {Boolean} [item.multiple]
   * @param {Element} item.target
   * @return {AX6UIAutocomplete}
   */
  bind(item) {
    let queIdx;
    item = jQuery.extend(true, {}, this.config, item);

    if (!item.target) {
      console.log(info.getError("ax6ui-autocomplete", "401", "bind"));
      return this;
    }
    item.$target = jQuery(item.target);

    if (!item.id) item.id = item.$target.data("data-ax6ui-autocomplete-id");
    if (!item.id) {
      item.id = 'ax6ui-autocomplete-' + AX6UICore.getInstanceId();
      item.$target.data("data-ax6ui-autocomplete-id", item.id);
    }
    item.name = item.$target.attr("data-ax6ui-autocomplete");

    item.options = [];
    item.selected = [];

    // target attribute data
    (function (data) {
      if (U.isObject(data) && !data.error) {
        item = jQuery.extend(true, item, data);
      }
    })(U.parseJson(item.$target.attr("data-ax6ui-autocomplete-config"), true));

    queIdx = U.search(this.queue, function () {
      return this.id == item.id;
    });

    if (queIdx === -1) {
      this.queue.push(item);
      bindAutocompleteTarget.call(this, this.queue.length - 1);
    }
    else {
      this.queue[queIdx].selected = [];
      this.queue[queIdx].options = item.options;
      this.queue[queIdx] = jQuery.extend(true, {}, this.queue[queIdx], item);
      bindAutocompleteTarget.call(this, queIdx);
    }

    queIdx = null;
    return this;
  }

  /**
   * open the optionBox of autocomplete
   * @method
   * @param {(String|Number|Element)} boundID
   * @param {Number} [tryCount]
   * @return {AX6UIAutocomplete}
   */
  open(boundID, tryCount) {
    this.waitOptionsCallback = null;

    /**
     * open autocomplete from the outside
     */
    let queIdx = (U.isNumber(boundID)) ? boundID : getQueIdx.call(this, boundID),
      item = this.queue[queIdx],
      data = {},
      focusTop,
      selectedOptionEl;

    if (item.$display.attr("disabled")) return this;

    if (this.openTimer) clearTimeout(this.openTimer);
    if (this.activeautocompleteOptionGroup) {
      if (this.activeautocompleteQueueIndex == queIdx) {
        return this;
      }

      if (tryCount > 2) return this;
      this.close();
      this.openTimer = setTimeout((function () {
        this.open(queIdx, (tryCount || 0) + 1);
      }).bind(this), this.config.animateTime);

      return this;
    }

    item.optionFocusIndex = -1; // optionGroup이 열리면 포커스 인덱스 초기화 -1로
    if (item.selected && item.selected.length > 0) {
      item.optionSelectedIndex = item.selected[0]["@findex"];
    }

    /// 템플릿에 전달할 오브젝트 선언
    data.id = item.id;
    data.theme = item.theme;
    data.multiple = item.multiple;

    data.lang = item.lang;
    item.$display.attr("data-autocomplete-option-group-opened", "true");

    data.waitOptions = true; // 타이핑값으로 options을 구해야 하므로 대기
    data.options = [];

    this.activeautocompleteOptionGroup = jQuery(mustache.render(tmpl.optionGroup.call(this, item.columnKeys), data));
    this.activeautocompleteOptionGroup.find('[data-els="content"]').html(mustache.render(tmpl.options.call(this, item.columnKeys), data));
    this.activeautocompleteQueueIndex = queIdx;

    alignAutocompleteOptionGroup.call(this, "append"); // alignAutocompleteOptionGroup 에서 body append

    if (item.selected && item.selected.length > 0) {
      selectedOptionEl = this.activeautocompleteOptionGroup.find('[data-option-index="' + item.selected[0]["@index"] + '"]');
      if (selectedOptionEl.get(0)) {
        focusTop = selectedOptionEl.position().top - this.activeautocompleteOptionGroup.height() / 3;
        this.activeautocompleteOptionGroup.find('[data-els="content"]').scrollTop(focusTop);
      }
    }

    jQuery(window).on("click.ax6ui-autocomplete-" + this.instanceId, (function (e) {
      e = e || window.event;
      onBodyClick.call(this, e);
      U.stopEvent(e);
    }).bind(this));

    onStateChanged.call(this, item, {
      self: this,
      state: "open",
      item: item
    });

    data = null;
    focusTop = null;
    selectedOptionEl = null;
    return this;
  }

  /**
   * @method
   * @param {(jQueryObject|Element|Number)} _boundID
   * @param {(String|Array)} _value
   * @return {AX6UIAutocomplete}
   * @example
   * ```js
   * myAutocomplete.setValue($('[data-ax6ui-autocomplete="autocomplete1"]'), {value:"test", text:"test"});
   * myAutocomplete.setValue($('[data-ax6ui-autocomplete="autocomplete1"]'), [{value:"test1", text:"test1"}, {value:"test2", text:"test2"}]);
   * myAutocomplete.setValue($('[data-ax6ui-autocomplete="autocomplete1"]'), null);
   * ```
   */
  setValue(_boundID, _value) {
    let queIdx = (U.isNumber(_boundID)) ? _boundID : getQueIdx.call(this, _boundID);
    if (queIdx === -1) {
      console.log(info.getError("ax6ui-autocomplete", "402", "val"));
      return;
    }

    clearSelected.call(this, queIdx);

    if (U.isArray(_value)) {
      let _values = U.map(_value, function () {
        return {value: this};
      });
      setSelected.call(this, queIdx, _values, true, {noStateChange: true});
    }
    else if (U.isObject(_value)) {
      setSelected.call(this, queIdx, {value: _value}, true, {noStateChange: true});
    } else {
      printLabel.call(this, queIdx);
    }

    blurLabel.call(this, queIdx);
    alignAutocompleteDisplay.call(this);

    return this;
  }

  /**
   * @method
   * @param {(jQueryObject|Element|Number)} _boundID
   * @param {(String|Array)} _text
   * @return {AX6UIAutocomplete}
   * @example
   * ```js
   * myAutocomplete.setText($('[data-ax6ui-autocomplete="autocomplete1"]'), "string");
   * myAutocomplete.setText($('[data-ax6ui-autocomplete="autocomplete1"]'), ["substring", "search"]);
   * ```
   */
  setText(_boundID, _text) {
    let queIdx = (U.isNumber(_boundID)) ? _boundID : getQueIdx.call(this, _boundID);
    if (queIdx === -1) {
      console.log(info.getError("ax6ui-autocomplete", "402", "val"));
      return;
    }

    this.queue[queIdx].selected = [];
    clearSelected.call(this, queIdx);
    setSelected.call(this, queIdx, _text, true, {noStateChange: true});
    blurLabel.call(this, queIdx);
    alignAutocompleteDisplay.call(this);

    return this;
  }

  /**
   * @method
   * @param {(jQueryObject|Element|Number)} _boundID
   * @returns {Array}
   */
  getSelectedOption(_boundID) {
    let queIdx = (U.isNumber(_boundID)) ? _boundID : getQueIdx.call(this, _boundID);
    if (queIdx === -1) {
      console.log(info.getError("ax6ui-autocomplete", "402", "val"));
      return;
    }
    return U.deepCopy(this.queue[queIdx].selected);
  }

  /**
   * @method
   * @return {AX6UIAutocomplete}
   */
  close(item) {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    if (!this.activeautocompleteOptionGroup) return this;

    item = this.queue[this.activeautocompleteQueueIndex];
    item.optionFocusIndex = -1;
    item.$display.removeAttr("data-autocomplete-option-group-opened").trigger("focus");

    this.activeautocompleteOptionGroup.addClass("destroy");

    jQuery(window)
      .off("resize.ax6ui-autocomplete-" + this.instanceId)
      .off("click.ax6ui-autocomplete-" + this.instanceId)
      .off("keyup.ax6ui-autocomplete-" + this.instanceId);

    this.closeTimer = setTimeout((function () {
      if (this.activeautocompleteOptionGroup) this.activeautocompleteOptionGroup.remove();
      this.activeautocompleteOptionGroup = null;
      this.activeautocompleteQueueIndex = -1;

      onStateChanged.call(this, item, {
        self: this,
        state: "close"
      });

    }).bind(this), this.config.animateTime);
    this.waitOptionsCallback = null;
    return this;
  }

  /**
   * @method
   * @param {(jQueryObject|Element|Number)} _boundID
   * @return {AX6UIAutocomplete}
   */
  blur(_boundID) {
    let queIdx = (U.isNumber(_boundID)) ? _boundID : getQueIdx.call(this, _boundID);
    if (queIdx === -1) {
      console.log(info.getError("ax6ui-autocomplete", "402", "val"));
      return;
    }

    blurLabel.call(this, queIdx);
    return this;
  }

  /**
   * @method
   * @param {(jQueryObject|Element|Number)} _boundID
   * @return {AX6UIAutocomplete}
   */
  enable(_boundID) {
    let queIdx = getQueIdx.call(this, _boundID);

    if (typeof queIdx !== "undefined") {
      this.queue[queIdx].disable = false;
      if (this.queue[queIdx].$display[0]) {
        this.queue[queIdx].$display.removeAttr("disabled");
        this.queue[queIdx].$displayLabelInput.removeAttr("disabled");
      }
      if (this.queue[queIdx].$select[0]) {
        this.queue[queIdx].$select.removeAttr("disabled");

      }

      onStateChanged.call(this, this.queue[queIdx], {
        self: this,
        state: "enable"
      });
    }

    return this;
  }

  /**
   * @method
   * @param {(jQueryObject|Element|Number)} _boundID
   * @return {AX6UIAutocomplete}
   */
  disable(_boundID) {
    let queIdx = getQueIdx.call(this, _boundID);

    if (typeof queIdx !== "undefined") {
      this.queue[queIdx].disable = true;
      if (this.queue[queIdx].$display[0]) {
        this.queue[queIdx].$display.attr("disabled", "disabled");
        this.queue[queIdx].$displayLabelInput.attr("disabled", "disabled");
      }
      if (this.queue[queIdx].$select[0]) {
        this.queue[queIdx].$select.attr("disabled", "disabled");
      }

      onStateChanged.call(this, this.queue[queIdx], {
        self: this,
        state: "disable"
      });
    }

    return this;
  }

  /**
   * @method
   * @return {AX6UIAutocomplete}
   */
  align() {
    alignAutocompleteDisplay.call(this);
    return this;
  }

}

export default AX6UIAutocomplete;