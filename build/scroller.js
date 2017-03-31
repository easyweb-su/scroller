(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

  // Array.from polyfill

  if (!Array.from) Array.from = require('array-from');

  // remove polyfill

  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) return;

      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          this.parentNode.removeChild(this);
        }
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

  // matches polyfill

  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || function (selector) {
      var matches = document.querySelectorAll(selector),
          th = this;
      return Array.prototype.some.call(matches, function (e) {
        return e === th;
      });
    };
  }

  // closest polyfill

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (css) {
      var node = this;

      while (node) {
        if (node.matches(css)) return node;else node = node.parentElement;
      }

      return null;
    };
  }

  // helpers

  var getElement = function getElement() {
    var selector = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var ctx = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    var node = ctx.querySelectorAll(selector);
    return node ? node[0] : null;
  };

  var getElements = function getElements() {
    var selector = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var ctx = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    var nodes = ctx.querySelectorAll(selector);
    return nodes || null;
  };

  var getEventX = function getEventX(e) {
    return e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length && e.originalEvent.touches[0].pageX || e.touches && e.touches.length && e.touches[0].pageX || e.pageX || 0;
  };

  var getChildren = function getChildren(el) {
    var childNodes = el.childNodes,
        children = [],
        i = childNodes.length;

    while (i--) {
      if (childNodes[i].nodeType == 1) children.unshift(childNodes[i]);
    }

    return children;
  };

  var isAndroid = function isAndroid() {
    return navigator.userAgent.toLowerCase().indexOf("android") > -1;
  };

  // scroller

  var Scroller = function () {
    function Scroller(config) {
      _classCallCheck(this, Scroller);

      var _config$align = config.align;
      var align = _config$align === undefined ? 'center' : _config$align;
      var _config$noAnchors = config.noAnchors;
      var noAnchors = _config$noAnchors === undefined ? false : _config$noAnchors;
      var _config$noScrollbar = config.noScrollbar;
      var noScrollbar = _config$noScrollbar === undefined ? false : _config$noScrollbar;
      var _config$start = config.start;
      var start = _config$start === undefined ? 0 : _config$start;
      var _config$startAnimDura = config.startAnimDuration;
      var startAnimDuration = _config$startAnimDura === undefined ? 1000 : _config$startAnimDura;
      var el = config.el;
      var onClick = config.onClick;


      this.config = {
        align: align,
        noAnchors: noAnchors,
        noScrollbar: noScrollbar,
        onClick: onClick,
        start: start,
        startAnimDuration: startAnimDuration,

        prefix: 'ab_scroller',
        draggingClsnm: 'is-dragging',
        leftAlignClsnm: 'is-left-align',
        borderVsblClsnm: 'is-visible',
        noAnchorsClsnm: 'is-no-anchors',
        noScrollbarClsnm: 'is-no-scrollbar',

        easing: function easing(pos) {
          return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
        }
      };

      this.state = {
        scrolled: 0,
        scrollable: true,

        pointerDown: false,
        scrollbarPointerDown: false,
        mouseScroll: false,

        scrollbarWidth: 0,
        scrollbarFactor: 0,

        pageX: [],
        scrolledDiff: 0,
        downEventTS: 0,
        moveEventTS: 0,

        scrollbarDownPageX: 0,
        scrollClickDisabled: false,

        limitLeft: 0,
        limitRight: 0,
        stripWidth: 0,

        swipeDirection: null,
        touchX: 0,
        touchY: 0,

        let: el.hasChildNodes() && getChildren(el).length || 0,
        el: el || null,

        isAndroid: isAndroid()
      };

      window.raf = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
          setTimeout(callback, 1000 / 60);
        };
      }();

      this.init(el);
    }

    _createClass(Scroller, [{
      key: 'get',
      value: function get(prop) {
        return typeof this.state[prop] !== 'undefined' ? this.state[prop] : null;
      }
    }, {
      key: 'set',
      value: function set(prop, value) {
        this.state[prop] = value;
      }
    }, {
      key: 'push',
      value: function push(prop, value) {
        this.state[prop] && this.state[prop].push(value);
      }
    }, {
      key: 'clear',
      value: function clear(prop) {
        var field = this.state[prop];
        if (field && field.length) field.length = 0;
      }
    }, {
      key: 'getLastMeaningfull',
      value: function getLastMeaningfull(prop) {
        var field = this.state[prop];
        var toIgnore = field && field.length && field.length > 3 ? 3 : 1;
        return field[field.length - toIgnore] || 0;
      }
    }, {
      key: 'addClass',
      value: function addClass(el, cl) {
        if (!new RegExp('(\\s|^)' + cl + '(\\s|$)').test(el.className)) el.className += ' ' + cl;
      }
    }, {
      key: 'removeClass',
      value: function removeClass(el, cl) {
        el.className = el.className.replace(new RegExp('(\\s+|^)' + cl + '(\\s+|$)', 'g'), ' ').replace(/^\s+|\s+$/g, '');
      }
    }, {
      key: 'alignScbToRight',
      value: function alignScbToRight() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        this.addClass(el, 'is-right');
      }
    }, {
      key: 'releaseScb',
      value: function releaseScb() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        this.removeClass(el, 'is-right');
      }
    }, {
      key: 'setPos',
      value: function setPos(pos) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-strip', rootNode);
        this.setPosition(el, pos);
      }
    }, {
      key: 'setScbPos',
      value: function setScbPos(pos) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        this.setPosition(el, pos);
      }
    }, {
      key: 'setPosition',
      value: function setPosition(el, pos) {
        el.style.webkitTransform = 'translateX(' + pos + 'px)';
        el.style.MozTransform = el.style.msTransform = el.style.OTransform = el.style.transform = 'translateX(' + pos + 'px)';
      }
    }, {
      key: 'setWidth',
      value: function setWidth(width) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        el.style.width = width + 'px';
      }
    }, {
      key: 'init',
      value: function init(el) {
        var _this = this;

        this.createWrapper();
        this.wrapItems();
        this.createAnchors();
        this.setSize();
        this.checkScrollable();

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var linkNodes = getElements('a', stripNode);

        var scrollNode = getElement('.' + prefix + '-scrollwrap', rootNode);
        var scrollbarNode = getElement('.' + prefix + '-scrollbar', rootNode);

        var anchorsNodes = getElements('.' + prefix + '-anchor', rootNode);

        // config
        if (rootNode.getAttribute('data-leftalign') || rootNode.getAttribute('data-leftIfWide') || this.config.align !== 'center') {
          this.addClass(rootNode, this.config.leftAlignClsnm);
        }

        if (this.config.noAnchors || rootNode.getAttribute('data-noanchors')) {
          this.addClass(rootNode, this.config.noAnchorsClsnm);
        }

        if (this.config.noScrollbar || rootNode.getAttribute('data-noscrollbar')) {
          this.addClass(rootNode, this.config.noScrollbarClsnm);
        }

        if (rootNode.getAttribute('data-start')) {
          this.config.start = rootNode.getAttribute('data-start');
        }

        if (rootNode.getAttribute('data-startAnimDuration')) {
          this.config.startAnimDuration = rootNode.getAttribute('data-startAnimDuration');
        }

        stripNode.addEventListener('mousedown', this.onPointerDown.bind(this));
        stripNode.addEventListener('touchstart', this.onPointerDown.bind(this));
        document.addEventListener('mousemove', this.onPointerMove.bind(this));
        document.addEventListener('touchmove', this.onPointerMove.bind(this));
        document.addEventListener('mouseup', this.onPointerUp.bind(this));
        document.addEventListener('touchend', this.onPointerUp.bind(this));

        scrollbarNode.addEventListener('mousedown', this.onScrollbarPointerDown.bind(this));
        scrollbarNode.addEventListener('touchstart', this.onScrollbarPointerDown.bind(this));
        document.addEventListener('mousemove', this.onScrollbarPointerMove.bind(this));
        document.addEventListener('touchmove', this.onScrollbarPointerMove.bind(this));
        document.addEventListener('mouseup', this.onScrollbarPointerUp.bind(this));
        document.addEventListener('touchend', this.onScrollbarPointerUp.bind(this));

        scrollNode.addEventListener('click', this.onScrollClick.bind(this));

        var wheelEvent = /Firefox/i.test(navigator.userAgent) ? 'wheel' : 'mousewheel';
        stripNode.addEventListener(wheelEvent, this.onScroll.bind(this));

        Array.from(anchorsNodes).forEach(function (anchorNode) {
          anchorNode.addEventListener('click', _this.onAnchorClick.bind(_this));
        });

        // prevent clickng on links
        Array.from(linkNodes).forEach(function (node) {
          node.addEventListener('click', _this.onClickLink.bind(_this), false);
        });

        // rerender
        window.addEventListener('resize', function (e) {
          _this.setSize();
          _this.checkScrollable();
        });

        window.addEventListener('load', function (e) {
          _this.setSize();
          _this.checkScrollable();
        });

        // check for display none
        var isHidden = function isHidden(el) {
          return el.offsetParent === null;
        };

        if (isHidden(rootNode)) {
          (function () {
            var intervalId = setInterval(function () {
              if (!isHidden(rootNode)) {
                var scrolled = _this.get('scrolled');
                clearInterval(intervalId);
                // no polyfills for triggering resize
                // just recalc twice
                _this._update();
                _this._update();

                var _start = _this.config.start || 0;
                var _startAnimDuration = _this.config.startAnimDuration || 0;
                _this.scrollTo(_start, _startAnimDuration);
              }
            }, 50);
          })();
        }

        var start = this.config.start;
        var startAnimDuration = this.config.startAnimDuration;
        this.scrollTo(start, startAnimDuration);
        this.checkBorderVisibility();
      }
    }, {
      key: 'createWrapper',
      value: function createWrapper() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var prevHtml = rootNode.innerHTML;
        var wrapperHtml = '<div class="' + prefix + '-wrapper">\n        <div class="' + prefix + '-border ' + prefix + '-border--left"></div>\n        <div class="' + prefix + '-border ' + prefix + '-border--right"></div>\n        <div class="' + prefix + '-strip">' + prevHtml + '</div>\n\n        <div class="' + prefix + '-scrollwrap">\n          <div class="' + prefix + '-scrollbar"></div>\n        </div>\n        <div class="' + prefix + '-anchors"></div>\n      </div>';

        rootNode.innerHTML = wrapperHtml;
        this.addClass(rootNode, prefix);
      }
    }, {
      key: 'wrapItems',
      value: function wrapItems() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);

        Array.from(getChildren(wrapperNode)).forEach(function (itemNode) {
          var itemWrapper = document.createElement('div');
          itemWrapper.innerHTML = itemNode.outerHTML;
          itemWrapper.setAttribute('class', prefix + '-item');
          itemNode.parentNode.insertBefore(itemWrapper, itemNode);
          itemNode.remove();
        });
      }
    }, {
      key: 'createAnchors',
      value: function createAnchors() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        var anchorsHtml = '',
            counter = 0;

        Array.from(getChildren(wrapperNode)).forEach(function (itemNode) {
          var targetNode = getElement('[data-anchor]', itemNode);
          var anchorText = targetNode ? targetNode.getAttribute('data-anchor') : '';

          anchorsHtml += '<span data-anchorid="' + counter + '" class="' + prefix + '-anchor"><span>' + anchorText + '</span></span>';
          itemNode.setAttribute('data-anchororiginid', counter);
          counter++;
        });

        ancWrapperNode.innerHTML = anchorsHtml;
      }
    }, {
      key: 'setSize',
      value: function setSize() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var wrapperNode = getElement('.' + prefix + '-wrapper', rootNode);
        var scrollbarNode = getElement('.' + prefix + '-scrollbar', rootNode);
        var scrollwrapNode = getElement('.' + prefix + '-scrollwrap', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var maxHeight = 0,
            sumWidth = 0;

        rootNode.setAttribute('style', '');
        stripNode.setAttribute('style', '');
        wrapperNode.setAttribute('style', '');
        scrollbarNode.setAttribute('style', '');
        scrollwrapNode.setAttribute('style', '');

        Array.from(itemNodes).forEach(function (itemNode) {
          var currentHeight = itemNode.offsetHeight;
          if (currentHeight > maxHeight) maxHeight = currentHeight;
          sumWidth += itemNode.offsetWidth;
        });

        var wrapperWidth = wrapperNode.offsetWidth;
        var scrollwrapWidth = scrollwrapNode.offsetWidth;
        var limitRight = sumWidth + 1 - rootNode.offsetWidth;

        var scrollbarFactor = scrollwrapWidth / sumWidth;
        var scrolled = Math.min(this.get('scrolled'), limitRight);
        var scbScrolled = scrolled * scrollbarFactor;

        rootNode.style.height = maxHeight + 'px';
        stripNode.style.height = maxHeight + 'px';
        stripNode.style.width = sumWidth + 1 + 'px';
        wrapperNode.style.height = maxHeight + 'px';
        scrollbarNode.style.width = wrapperWidth * scrollbarFactor + 'px';

        this.setPos(-1 * scrolled);
        this.setScbPos(scbScrolled);
        this.set('limitRight', limitRight);
        this.set('scrollbarFactor', scrollbarFactor);
        this.set('scrollbarWidth', wrapperWidth * scrollbarFactor);
      }
    }, {
      key: 'checkScrollable',
      value: function checkScrollable() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var wrapperNode = getElement('.' + prefix + '-wrapper', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        var sumWidth = 0,
            wrapperWidth = wrapperNode.offsetWidth;

        Array.from(itemNodes).forEach(function (itemNode) {
          sumWidth += itemNode.offsetWidth;
        });

        if (wrapperWidth >= sumWidth) {
          this.set('scrollable', false);
          this.addClass(rootNode, 'is-not-scrollable');
          ancWrapperNode.setAttribute('style', 'width: ' + sumWidth + 'px');
        } else {
          this.set('scrollable', true);
          this.removeClass(rootNode, 'is-not-scrollable');
          ancWrapperNode.setAttribute('style', 'width:auto');
        }
      }
    }, {
      key: '_update',
      value: function _update() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        if (this.config.align !== 'center') this.addClass(rootNode, this.config.leftAlignClsnm);else this.removeClass(rootNode, this.config.leftAlignClsnm);

        if (this.config.noAnchors) this.addClass(rootNode, this.config.noAnchorsClsnm);else this.removeClass(rootNode, this.config.noAnchorsClsnm);

        if (this.config.noScrollbar) this.addClass(rootNode, this.config.noScrollbarClsnm);else this.removeClass(rootNode, this.config.noScrollbarClsnm);

        this.setSize();
        this.checkScrollable();
        this.checkBorderVisibility();

        if (!this.config.noScrollbar) {
          var scrolled = this.get('scrolled');
          this.animate(scrolled, scrolled, 0);
        }
      }
    }, {
      key: 'checkElement',
      value: function checkElement(e) {
        return e.target.closest('.' + this.config.prefix) == this.state.el;
      }
    }, {
      key: 'onPointerDown',
      value: function onPointerDown(e) {
        var scrollable = this.get('scrollable');
        if (!e || !scrollable) return;

        this.handleTouchStart(e);
        if (this.get('isAndroid') || !e.touches && (!e.originalEvent || !e.originalEvent.touches)) e.preventDefault();

        this.set('pointerDown', true);
        this.set('scrollbarPointerDown', false);
        this.set('mouseScroll', false);
        this.set('downEventTS', new Date().getTime());

        var diff = this.get('scrolled') + getEventX(e);
        this.set('scrolledDiff', diff);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.addClass(getElement('html'), this.config.draggingClsnm);

        return;
      }
    }, {
      key: 'onPointerMove',
      value: function onPointerMove(e) {
        var scrollable = this.get('scrollable');
        var pointerDown = this.get('pointerDown');

        if (!e || !pointerDown || !scrollable) return;

        this.handleTouchMove(e);
        if (this.get('swipeDirection') == 'v') return;

        e.preventDefault();

        var scrolledDiff = this.get('scrolledDiff');
        var scrolled = this.get('scrolled');

        // drag to left is positive number
        var currentPageX = getEventX(e);
        var result = scrolledDiff - currentPageX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarResult = result * scrollbarFactor;
        var scrollbarWidth = this.get('scrollbarWidth');

        if (result < limitLeft) {
          result = Math.round(0.2 * result);
          scrollbarWidth += Math.round(0.2 * scrollbarResult);
          scrollbarResult = 0;
          this.setWidth(scrollbarWidth);
        } else if (result > limitRight) {
          result = Math.round(0.2 * result + 0.8 * limitRight);
          scrollbarWidth -= Math.round(0.8 * (result - limitRight) * scrollbarFactor);
          this.alignScbToRight();
          this.setWidth(scrollbarWidth);
        } else {
          this.releaseScb();
        }

        this.setPos(-1 * result);
        this.setScbPos(scrollbarResult);

        this.set('scrolled', result);
        this.set('moveEventTS', new Date().getTime());
        this.push('pageX', currentPageX);

        this.checkBorderVisibility();
        return false;
      }
    }, {
      key: 'onPointerUp',
      value: function onPointerUp(e) {
        var scrollable = this.get('scrollable');
        var pointerDown = this.get('pointerDown');

        if (!e || !pointerDown || !scrollable) return;

        if (this.get('swipeDirection') == 'v') {
          this.set('pointerDown', false);
          this.set('scrollbarPointerDown', false);
          this.set('mouseScroll', false);
          this.set('swipeDirection', null);
          this.clear('pageX');
          return;
        }

        e.preventDefault();
        this.set('pointerDown', false);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.removeClass(getElement('html'), this.config.draggingClsnm);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');

        var lastPageX = this.getLastMeaningfull('pageX');
        var currentEventX = getEventX(e);
        var distanceDelta = currentEventX - lastPageX;
        var timeDelta = (new Date().getTime() - this.get('moveEventTS')) / 1.5;
        var endpoint = scrolled - distanceDelta * 8;

        // clicked
        if (lastPageX === 0) {
          if (this.config.onClick) return this.config.onClick(e);

          var linkNode = e.target.closest('a');
          if (!linkNode) return;

          var target = linkNode.getAttribute('target');
          var href = linkNode.getAttribute('href');
          var ctrlClick = e.ctrlKey || e.metaKey;

          if (ctrlClick) return window.open(href);
          if (!target && href) return window.location.href = href;
          if (target.indexOf('blank') > -1 && href) return window.open(href);
        }

        // dragged
        // sticky left
        if (scrolled < limitLeft) this.animate(scrolled, limitLeft, 10, true);
        // too much to left
        else if (endpoint < limitLeft) this.animate(scrolled, limitLeft, 10);
          // sticky right
          else if (scrolled > limitRight) this.animate(scrolled, limitRight, 10, true);
            // too much to right
            else if (endpoint > limitRight) this.animate(scrolled, limitRight, 10);
              // otherwise
              else if (timeDelta < 150 && Math.abs(distanceDelta) > 2) {
                  var timeToEndpoint = Math.round(Math.abs(distanceDelta) / timeDelta);
                  this.animate(scrolled, Math.round(endpoint), timeToEndpoint);
                }

        this.clear('pageX');
        return false;
      }
    }, {
      key: 'onClickLink',
      value: function onClickLink(e) {
        var scrollable = this.get('scrollable');
        if (!scrollable) return e;

        e.preventDefault();
        return false;
      }
    }, {
      key: 'onScroll',
      value: function onScroll(e) {
        var scrollable = this.get('scrollable');
        if (!e || !e.deltaX || Math.abs(e.deltaY) > Math.abs(e.deltaX) || !scrollable) return;

        e.preventDefault();

        var deltaX = e.deltaX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var result = Math.min(Math.max(this.get('scrolled') + deltaX, limitLeft), limitRight);

        var scrollbarWidth = this.get('scrollbarWidth');
        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarResult = result * scrollbarFactor;

        this.setPos(-1 * result);

        if (result == limitRight) this.alignScbToRight();else this.releaseScb();

        this.setScbPos(scrollbarResult);
        this.setWidth(scrollbarWidth);
        this.set('scrolled', result);
        this.set('mouseScroll', true);

        this.checkBorderVisibility();
        return false;
      }
    }, {
      key: 'onScrollClick',
      value: function onScrollClick(e) {
        var scrollable = this.get('scrollable');
        var scrollClickDisabled = this.get('scrollClickDisabled');

        if (scrollClickDisabled) {
          this.set('scrollClickDisabled', false);
          return;
        }

        if (!e || !e.preventDefault || !scrollable) return;
        e.preventDefault();

        var scbWidth = this.get('scrollbarWidth');
        var scbFactor = this.get('scrollbarFactor');
        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var rightScbLimit = limitRight * scbFactor;
        var scrolled = this.get('scrolled');

        var pageX = getEventX(e);
        var center = pageX - scbWidth / 2;
        var leftEdge = center - scbWidth / 2;
        var rightEdge = center + scbWidth / 2;

        var endpoint = center / scbFactor;
        if (leftEdge < limitLeft) endpoint = limitLeft;else if (rightEdge > rightScbLimit) endpoint = limitRight;

        this.animate(scrolled, endpoint);
        return false;
      }
    }, {
      key: 'onAnchorClick',
      value: function onAnchorClick(e) {
        var scrollable = this.get('scrollable');
        if (!e || !e.target || !scrollable) return;

        var anchorid = e.target.closest('[data-anchorid]').getAttribute('data-anchorid');
        if (!anchorid) return;

        this.releaseScb();

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var targetNode = getElement('[data-anchororiginid="' + anchorid + '"]', rootNode);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');

        var endpoint = Math.min(Math.max(targetNode.offsetLeft, limitLeft), limitRight);
        if (Math.abs(endpoint) < 2) endpoint = 0;

        this.set('mouseScroll', false);
        this.animate(scrolled, endpoint);
        return false;
      }
    }, {
      key: 'onScrollbarPointerDown',
      value: function onScrollbarPointerDown(e) {
        if (!e) return;
        e.preventDefault();
        e.stopPropagation();

        this.releaseScb();

        var currentPageX = getEventX(e);
        var scrolled = this.get('scrolled');
        var scrollbarFactor = this.get('scrollbarFactor');

        this.set('scrollbarPointerDown', true);
        this.set('scrollClickDisabled', true);
        this.set('pointerDown', false);
        this.set('mouseScroll', false);
        this.set('scrollbarDownPageX', currentPageX - scrolled * scrollbarFactor);

        return false;
      }
    }, {
      key: 'onScrollbarPointerMove',
      value: function onScrollbarPointerMove(e) {
        var scbPointerDown = this.get('scrollbarPointerDown');
        if (!e || !scbPointerDown) return;
        e.preventDefault();
        e.stopPropagation();

        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarDownPageX = this.get('scrollbarDownPageX');
        var currentPageX = getEventX(e);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var delta = currentPageX - scrollbarDownPageX;
        var result = Math.min(Math.max(delta / scrollbarFactor, limitLeft), limitRight);
        var scrollbarResult = result * scrollbarFactor;

        this.setPos(-1 * result);
        this.setScbPos(scrollbarResult);

        this.set('scrolled', result);
        this.checkBorderVisibility();
        return false;
      }
    }, {
      key: 'onScrollbarPointerUp',
      value: function onScrollbarPointerUp(e) {
        var scbPointerDown = this.get('scrollbarPointerDown');

        if (!e || !scbPointerDown) return;
        e.preventDefault();
        e.stopPropagation();

        this.set('scrollbarPointerDown', false);
        return false;
      }
    }, {
      key: 'handleTouchStart',
      value: function handleTouchStart(e) {
        if (!e.touches && !e.originalEvent) return;
        this.set('touchX', e.touches[0].clientX || e.originalEvent.touches[0].clientX);
        this.set('touchY', e.touches[0].clientY || e.originalEvent.touches[0].clientY);
      }
    }, {
      key: 'handleTouchMove',
      value: function handleTouchMove(e) {
        var touchX = this.get('touchX');
        var touchY = this.get('touchY');
        if (!touchX || !touchY || !e.touches && !e.originalEvent) return;

        var xUp = e.touches[0].clientX || e.originalEvent.touches[0].clientX;
        var yUp = e.touches[0].clientY || e.originalEvent.touches[0].clientY;

        var xDiff = touchX - xUp;
        var yDiff = touchY - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) this.set('swipeDirection', 'h');else this.set('swipeDirection', 'v');

        this.set('touchX', 0);
        this.set('touchY', 0);
      }
    }, {
      key: 'animate',
      value: function animate(start) {
        var stop = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var _this2 = this;

        var speed = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];
        var animateWidth = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var delta = stop - start;
        var time = Math.max(.05, Math.min(Math.abs(delta) / speed, 1));
        var scbFactor = this.get('scrollbarFactor');
        var rightScbLimit = this.get('limitRight') * scbFactor;
        var limitRight = this.get('limitRight');

        var currentTime = speed == 0 ? 1 : 0,
            endpoint = this.get('scrolled'),
            scbEndpoint = endpoint * scbFactor;

        var tick = function tick() {
          if (_this2.get('pointerDown') || _this2.get('mouseScroll')) return;

          currentTime += 1 / 60;
          endpoint = currentTime < 1 ? start + delta * _this2.config.easing(currentTime / time) : stop;

          scbEndpoint = currentTime < 1 ? start * scbFactor + delta * _this2.config.easing(currentTime / time) * scbFactor : stop * scbFactor;

          scbEndpoint = Math.min(scbEndpoint, rightScbLimit);

          if (!animateWidth) {
            if (scbEndpoint >= rightScbLimit) _this2.alignScbToRight();else _this2.releaseScb();
            _this2.setScbPos(scbEndpoint);
          } else {
            var scbw = _this2.get('scrollbarWidth');
            if (start < stop) scbw -= delta * scbFactor * (1 - _this2.config.easing(currentTime / time));else scbw += delta * scbFactor * (1 - _this2.config.easing(currentTime / time));

            _this2.setWidth(scbw);
          }

          _this2.setPos(-1 * endpoint);
          _this2.set('scrolled', endpoint);

          if (currentTime < 1) raf(tick);else _this2.checkBorderVisibility();
        };

        return tick();
      }
    }, {
      key: 'checkBorderVisibility',
      value: function checkBorderVisibility() {
        var scrolled = this.get('scrolled');
        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');

        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        if (scrolled > limitLeft) {
          var leftBorder = getElement('.' + prefix + '-border--left', rootNode);
          this.addClass(leftBorder, this.config.borderVsblClsnm);
        } else {
          var _leftBorder = getElement('.' + prefix + '-border--left', rootNode);
          this.removeClass(_leftBorder, this.config.borderVsblClsnm);
        }

        if (scrolled < limitRight) {
          var rightBorder = getElement('.' + prefix + '-border--right', rootNode);
          this.addClass(rightBorder, this.config.borderVsblClsnm);
        } else {
          var _rightBorder = getElement('.' + prefix + '-border--right', rootNode);
          this.removeClass(_rightBorder, this.config.borderVsblClsnm);
        }
      }

      // public API

    }, {
      key: 'scrollTo',
      value: function scrollTo(point) {
        var time = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];

        var limitRight = this.get('limitRight');
        var limitLeft = this.get('limitLeft');
        var endpoint = !isNaN(point) ? parseInt(point) : 0;
        endpoint = Math.min(Math.max(endpoint, limitLeft), limitRight);

        if (point == 'end') endpoint = limitRight;else if (point == 'start') endpoint = limitLeft;else if (point == 'center') endpoint = limitRight / 2;

        this.animate(this.get('scrolled'), endpoint, time);
      }
    }, {
      key: 'update',
      value: function update(config) {
        var _config$align2 = config.align;
        var align = _config$align2 === undefined ? this.config.align : _config$align2;
        var _config$noAnchors2 = config.noAnchors;
        var noAnchors = _config$noAnchors2 === undefined ? this.config.noAnchors : _config$noAnchors2;
        var _config$noScrollbar2 = config.noScrollbar;
        var noScrollbar = _config$noScrollbar2 === undefined ? this.config.noScrollbar : _config$noScrollbar2;
        var _config$onClick = config.onClick;
        var onClick = _config$onClick === undefined ? this.config.onClick : _config$onClick;
        var _config$start2 = config.start;
        var start = _config$start2 === undefined ? this.config.start : _config$start2;
        var _config$startAnimDura2 = config.startAnimDuration;
        var startAnimDuration = _config$startAnimDura2 === undefined ? this.config.startAnimDuration : _config$startAnimDura2;


        this.config.align = align;
        this.config.noAnchors = noAnchors;
        this.config.noScrollbar = noScrollbar;
        this.config.onClick = onClick;
        this.config.startAnimDuration = startAnimDuration;
        this.config.start = start;

        this._update();
      }
    }]);

    return Scroller;
  }();

  // init config

  var autoinit = function autoinit() {
    var els = getElements('.scroller');
    Array.from(els).forEach(function (el) {
      var scroller = new Scroller({ el: el });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    return autoinit;
  });

  document.onreadystatechange = function () {
    if (document.readyState == "interactive") autoinit();
  };

  window.Scroller = Scroller;
})();

},{"array-from":2}],2:[function(require,module,exports){
module.exports = (typeof Array.from === 'function' ?
  Array.from :
  require('./polyfill')
);

},{"./polyfill":3}],3:[function(require,module,exports){
// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: http://www.ecma-international.org/ecma-262/6.0/#sec-array.from
module.exports = (function() {
  var isCallable = function(fn) {
    return typeof fn === 'function';
  };
  var toInteger = function (value) {
    var number = Number(value);
    if (isNaN(number)) { return 0; }
    if (number === 0 || !isFinite(number)) { return number; }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  };
  var maxSafeInteger = Math.pow(2, 53) - 1;
  var toLength = function (value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  };
  var iteratorProp = function(value) {
    if(value != null) {
      if(['string','number','boolean','symbol'].indexOf(typeof value) > -1){
        return Symbol.iterator;
      } else if (
        (typeof Symbol !== 'undefined') &&
        ('iterator' in Symbol) &&
        (Symbol.iterator in value)
      ) {
        return Symbol.iterator;
      }
      // Support "@@iterator" placeholder, Gecko 27 to Gecko 35
      else if ('@@iterator' in value) {
        return '@@iterator';
      }
    }
  };
  var getMethod = function(O, P) {
    // Assert: IsPropertyKey(P) is true.
    if (O != null && P != null) {
      // Let func be GetV(O, P).
      var func = O[P];
      // ReturnIfAbrupt(func).
      // If func is either undefined or null, return undefined.
      if(func == null) {
        return void 0;
      }
      // If IsCallable(func) is false, throw a TypeError exception.
      if (!isCallable(func)) {
        throw new TypeError(func + ' is not a function');
      }
      return func;
    }
  };
  var iteratorStep = function(iterator) {
    // Let result be IteratorNext(iterator).
    // ReturnIfAbrupt(result).
    var result = iterator.next();
    // Let done be IteratorComplete(result).
    // ReturnIfAbrupt(done).
    var done = Boolean(result.done);
    // If done is true, return false.
    if(done) {
      return false;
    }
    // Return result.
    return result;
  };

  // The length property of the from method is 1.
  return function from(items /*, mapFn, thisArg */ ) {
    'use strict';

    // 1. Let C be the this value.
    var C = this;

    // 2. If mapfn is undefined, let mapping be false.
    var mapFn = arguments.length > 1 ? arguments[1] : void 0;

    var T;
    if (typeof mapFn !== 'undefined') {
      // 3. else
      //   a. If IsCallable(mapfn) is false, throw a TypeError exception.
      if (!isCallable(mapFn)) {
        throw new TypeError(
          'Array.from: when provided, the second argument must be a function'
        );
      }

      //   b. If thisArg was supplied, let T be thisArg; else let T
      //      be undefined.
      if (arguments.length > 2) {
        T = arguments[2];
      }
      //   c. Let mapping be true (implied by mapFn)
    }

    var A, k;

    // 4. Let usingIterator be GetMethod(items, @@iterator).
    // 5. ReturnIfAbrupt(usingIterator).
    var usingIterator = getMethod(items, iteratorProp(items));

    // 6. If usingIterator is not undefined, then
    if (usingIterator !== void 0) {
      // a. If IsConstructor(C) is true, then
      //   i. Let A be the result of calling the [[Construct]]
      //      internal method of C with an empty argument list.
      // b. Else,
      //   i. Let A be the result of the abstract operation ArrayCreate
      //      with argument 0.
      // c. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C()) : [];

      // d. Let iterator be GetIterator(items, usingIterator).
      var iterator = usingIterator.call(items);

      // e. ReturnIfAbrupt(iterator).
      if (iterator == null) {
        throw new TypeError(
          'Array.from requires an array-like or iterable object'
        );
      }

      // f. Let k be 0.
      k = 0;

      // g. Repeat
      var next, nextValue;
      while (true) {
        // i. Let Pk be ToString(k).
        // ii. Let next be IteratorStep(iterator).
        // iii. ReturnIfAbrupt(next).
        next = iteratorStep(iterator);

        // iv. If next is false, then
        if (!next) {

          // 1. Let setStatus be Set(A, "length", k, true).
          // 2. ReturnIfAbrupt(setStatus).
          A.length = k;

          // 3. Return A.
          return A;
        }
        // v. Let nextValue be IteratorValue(next).
        // vi. ReturnIfAbrupt(nextValue)
        nextValue = next.value;

        // vii. If mapping is true, then
        //   1. Let mappedValue be Call(mapfn, T, «nextValue, k»).
        //   2. If mappedValue is an abrupt completion, return
        //      IteratorClose(iterator, mappedValue).
        //   3. Let mappedValue be mappedValue.[[value]].
        // viii. Else, let mappedValue be nextValue.
        // ix.  Let defineStatus be the result of
        //      CreateDataPropertyOrThrow(A, Pk, mappedValue).
        // x. [TODO] If defineStatus is an abrupt completion, return
        //    IteratorClose(iterator, defineStatus).
        if (mapFn) {
          A[k] = mapFn.call(T, nextValue, k);
        }
        else {
          A[k] = nextValue;
        }
        // xi. Increase k by 1.
        k++;
      }
      // 7. Assert: items is not an Iterable so assume it is
      //    an array-like object.
    } else {

      // 8. Let arrayLike be ToObject(items).
      var arrayLike = Object(items);

      // 9. ReturnIfAbrupt(items).
      if (items == null) {
        throw new TypeError(
          'Array.from requires an array-like object - not null or undefined'
        );
      }

      // 10. Let len be ToLength(Get(arrayLike, "length")).
      // 11. ReturnIfAbrupt(len).
      var len = toLength(arrayLike.length);

      // 12. If IsConstructor(C) is true, then
      //     a. Let A be Construct(C, «len»).
      // 13. Else
      //     a. Let A be ArrayCreate(len).
      // 14. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 15. Let k be 0.
      k = 0;
      // 16. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = arrayLike[k];
        if (mapFn) {
          A[k] = mapFn.call(T, kValue, k);
        }
        else {
          A[k] = kValue;
        }
        k++;
      }
      // 17. Let setStatus be Set(A, "length", len, true).
      // 18. ReturnIfAbrupt(setStatus).
      A.length = len;
      // 19. Return A.
    }
    return A;
  };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7OztBQUlWLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSLENBQWI7Ozs7QUFLakIsR0FBQyxVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FiRCxFQWFHLENBQUMsUUFBUSxTQUFULEVBQW9CLGNBQWMsU0FBbEMsRUFBNkMsYUFBYSxTQUExRCxDQWJIOzs7O0FBa0JBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtVQUFtRCxLQUFLLElBQXhEO0FBQ0EsYUFBTyxNQUFNLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUIsRUFBbUMsVUFBUyxDQUFULEVBQVc7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgXG4gIC8vIEFycmF5LmZyb20gcG9seWZpbGxcbiAgXG4gIGlmICghQXJyYXkuZnJvbSkgQXJyYXkuZnJvbSA9IHJlcXVpcmUoJ2FycmF5LWZyb20nKTtcbiAgXG5cbiAgLy8gcmVtb3ZlIHBvbHlmaWxsXG5cbiAgKGZ1bmN0aW9uIChhcnIpIHtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3JlbW92ZScpKSByZXR1cm5cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKFtFbGVtZW50LnByb3RvdHlwZSwgQ2hhcmFjdGVyRGF0YS5wcm90b3R5cGUsIERvY3VtZW50VHlwZS5wcm90b3R5cGVdKVxuXG5cbiAgLy8gbWF0Y2hlcyBwb2x5ZmlsbFxuXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIHRoID0gdGhpc1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zb21lLmNhbGwobWF0Y2hlcywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHJldHVybiBlID09PSB0aFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNsb3Nlc3QgcG9seWZpbGxcblxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXNcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubWF0Y2hlcyhjc3MpKSByZXR1cm4gbm9kZVxuICAgICAgICBlbHNlIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuXG4gIC8vIGhlbHBlcnNcblxuICBjb25zdCBnZXRFbGVtZW50ID0gKHNlbGVjdG9yPScnLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGUgPyBub2RlWzBdIDogbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RWxlbWVudHMgPSAoc2VsZWN0b3I9JycsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGVzID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGVzIHx8IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEV2ZW50WCA9IGUgPT4ge1xuICAgIHJldHVybiBlLm9yaWdpbmFsRXZlbnQgXG4gICAgICAgICYmIGUub3JpZ2luYWxFdmVudC50b3VjaGVzIFxuICAgICAgICAmJiBlLm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggXG4gICAgICAgICYmIGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VYIFxuICAgICAgfHwgZS50b3VjaGVzXG4gICAgICAgICYmIGUudG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS50b3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnBhZ2VYIFxuICAgICAgfHwgMFxuICB9XG5cbiAgY29uc3QgZ2V0Q2hpbGRyZW4gPSAoZWwpID0+IHtcbiAgICBsZXQgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXMsXG4gICAgICAgIGNoaWxkcmVuID0gW10sXG4gICAgICAgIGkgPSBjaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT0gMSkgY2hpbGRyZW4udW5zaGlmdChjaGlsZE5vZGVzW2ldKVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZHJlblxuICB9XG5cbiAgY29uc3QgaXNBbmRyb2lkID0gKCkgPT4ge1xuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImFuZHJvaWRcIikgPiAtMVxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG5cbiAgY2xhc3MgU2Nyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj0nY2VudGVyJyxcbiAgICAgICAgbm9BbmNob3JzPWZhbHNlLFxuICAgICAgICBub1Njcm9sbGJhcj1mYWxzZSxcbiAgICAgICAgc3RhcnQ9MCxcbiAgICAgICAgc3RhcnRBbmltRHVyYXRpb249MTAwMCxcbiAgICAgICAgZWwsXG4gICAgICAgIG9uQ2xpY2tcbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgbm9BbmNob3JzOiBub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBub1Njcm9sbGJhcixcbiAgICAgICAgb25DbGljazogb25DbGljayxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBzdGFydEFuaW1EdXJhdGlvbjogc3RhcnRBbmltRHVyYXRpb24sXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuICAgICAgICBsZWZ0QWxpZ25DbHNubTogJ2lzLWxlZnQtYWxpZ24nLFxuICAgICAgICBib3JkZXJWc2JsQ2xzbm06ICdpcy12aXNpYmxlJyxcbiAgICAgICAgbm9BbmNob3JzQ2xzbm06ICdpcy1uby1hbmNob3JzJyxcbiAgICAgICAgbm9TY3JvbGxiYXJDbHNubTogJ2lzLW5vLXNjcm9sbGJhcicsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHNjcm9sbGFibGU6IHRydWUsXG5cbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBzY3JvbGxiYXJQb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICAgICAgc2Nyb2xsYmFyRmFjdG9yOiAwLFxuXG4gICAgICAgIHBhZ2VYOiBbXSxcbiAgICAgICAgc2Nyb2xsZWREaWZmOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgc2Nyb2xsYmFyRG93blBhZ2VYOiAwLFxuICAgICAgICBzY3JvbGxDbGlja0Rpc2FibGVkOiBmYWxzZSxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG4gICAgICAgIHN0cmlwV2lkdGg6IDAsXG5cbiAgICAgICAgc3dpcGVEaXJlY3Rpb246IG51bGwsXG4gICAgICAgIHRvdWNoWDogMCxcbiAgICAgICAgdG91Y2hZOiAwLFxuXG4gICAgICAgIGxldDogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldENoaWxkcmVuKGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG5cbiAgICAgICAgaXNBbmRyb2lkOiBpc0FuZHJvaWQoKVxuICAgICAgfVxuXG4gICAgICB3aW5kb3cucmFmID0gKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcblxuICAgICAgdGhpcy5pbml0KGVsKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXSB8fCAwXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIGFsaWduU2NiVG9SaWdodCgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuICAgIHJlbGVhc2VTY2IoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRTY2JQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKGVsLCBwb3MpIHtcbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG4gICAgc2V0V2lkdGgod2lkdGgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgLy8gY29uZmlnXG4gICAgICBpZiAoXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0YWxpZ24nKSB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKSB8fFxuICAgICAgICB0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcidcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycyB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9hbmNob3JzJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAocm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0JykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnQgPSByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKVxuICAgICAgfVxuXG4gICAgICBpZiAocm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0QW5pbUR1cmF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltRHVyYXRpb24gPSByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnRBbmltRHVyYXRpb24nKVxuICAgICAgfVxuXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIFxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TY3JvbGxDbGljay5iaW5kKHRoaXMpKVxuXG4gICAgICBjb25zdCB3aGVlbEV2ZW50ID0gKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcih3aGVlbEV2ZW50LCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmcgb24gbGlua3NcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHJlcmVuZGVyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIC8vIGNoZWNrIGZvciBkaXNwbGF5IG5vbmVcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gZWwgPT4gZWwub2Zmc2V0UGFyZW50ID09PSBudWxsXG5cbiAgICAgIGlmIChpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICAgIC8vIG5vIHBvbHlmaWxscyBmb3IgdHJpZ2dlcmluZyByZXNpemUgXG4gICAgICAgICAgICAvLyBqdXN0IHJlY2FsYyB0d2ljZVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpXG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5jb25maWcuc3RhcnQgfHwgMFxuICAgICAgICAgICAgY29uc3Qgc3RhcnRBbmltRHVyYXRpb24gPSB0aGlzLmNvbmZpZy5zdGFydEFuaW1EdXJhdGlvbiB8fCAwXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvKHN0YXJ0LCBzdGFydEFuaW1EdXJhdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDUwKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzdGFydCA9IHRoaXMuY29uZmlnLnN0YXJ0XG4gICAgICBjb25zdCBzdGFydEFuaW1EdXJhdGlvbiA9IHRoaXMuY29uZmlnLnN0YXJ0QW5pbUR1cmF0aW9uXG4gICAgICB0aGlzLnNjcm9sbFRvKHN0YXJ0LCBzdGFydEFuaW1EdXJhdGlvbilcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yc1wiPjwvZGl2PlxuICAgICAgPC9kaXY+YFxuXG4gICAgICByb290Tm9kZS5pbm5lckhUTUwgPSB3cmFwcGVySHRtbFxuICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgcHJlZml4KVxuICAgIH1cblxuICAgIHdyYXBJdGVtcygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcblxuICAgICAgQXJyYXkuZnJvbShnZXRDaGlsZHJlbih3cmFwcGVyTm9kZSkpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBpdGVtV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgaXRlbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbVdyYXBwZXIsIGl0ZW1Ob2RlKVxuICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjcmVhdGVBbmNob3JzKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGxldCBhbmNob3JzSHRtbCA9ICcnLCBjb3VudGVyID0gMFxuXG4gICAgICBBcnJheS5mcm9tKGdldENoaWxkcmVuKHdyYXBwZXJOb2RlKSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JdJywgaXRlbU5vZGUpXG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSB0YXJnZXROb2RlIFxuICAgICAgICAgID8gdGFyZ2V0Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yJylcbiAgICAgICAgICA6ICcnXG5cbiAgICAgICAgYW5jaG9yc0h0bWwgKz0gYDxzcGFuIGRhdGEtYW5jaG9yaWQ9XCIke2NvdW50ZXJ9XCIgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yXCI+PHNwYW4+JHthbmNob3JUZXh0fTwvc3Bhbj48L3NwYW4+YFxuICAgICAgICBpdGVtTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yb3JpZ2luaWQnLCBjb3VudGVyKVxuICAgICAgICBjb3VudGVyKytcbiAgICAgIH0pXG5cbiAgICAgIGFuY1dyYXBwZXJOb2RlLmlubmVySFRNTCA9IGFuY2hvcnNIdG1sXG4gICAgfVxuXG4gICAgc2V0U2l6ZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS13cmFwcGVyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgbWF4SGVpZ2h0ID0gMCwgc3VtV2lkdGggPSAwXG5cbiAgICAgIHJvb3ROb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHN0cmlwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICB3cmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGxiYXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHNjcm9sbHdyYXBOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50SGVpZ2h0ID0gaXRlbU5vZGUub2Zmc2V0SGVpZ2h0XG4gICAgICAgIGlmIChjdXJyZW50SGVpZ2h0ID4gbWF4SGVpZ2h0KSBtYXhIZWlnaHQgPSBjdXJyZW50SGVpZ2h0XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcFdpZHRoID0gc2Nyb2xsd3JhcE5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSBzY3JvbGx3cmFwV2lkdGggLyBzdW1XaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSBNYXRoLm1pbih0aGlzLmdldCgnc2Nyb2xsZWQnKSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjYlNjcm9sbGVkID0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS53aWR0aCA9IChzdW1XaWR0aCArIDEpICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc2Nyb2xsYmFyTm9kZS5zdHlsZS53aWR0aCA9ICh3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpICsgJ3B4J1xuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHNjcm9sbGVkKVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2NiU2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldCgnbGltaXRSaWdodCcsIGxpbWl0UmlnaHQpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRmFjdG9yJywgc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhcldpZHRoJywgd3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgIH1cblxuICAgIGNoZWNrU2Nyb2xsYWJsZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS13cmFwcGVyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgbGV0IHN1bVdpZHRoID0gMCwgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgaWYgKHdyYXBwZXJXaWR0aCA+PSBzdW1XaWR0aCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYWJsZScsIGZhbHNlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCAnaXMtbm90LXNjcm9sbGFibGUnKVxuICAgICAgICBhbmNXcmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYHdpZHRoOiAke3N1bVdpZHRofXB4YClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYWJsZScsIHRydWUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6YXV0b2ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgX3VwZGF0ZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcicpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycykgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG5cbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG5cbiAgICAgIGlmICghdGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIHNjcm9sbGVkLCAwKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRWxlbWVudChlKSB7XG4gICAgICByZXR1cm4gZS50YXJnZXQuY2xvc2VzdChgLiR7dGhpcy5jb25maWcucHJlZml4fWApID09IHRoaXMuc3RhdGUuZWxcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hTdGFydChlKVxuICAgICAgaWYgKHRoaXMuZ2V0KCdpc0FuZHJvaWQnKSB8fCAhZS50b3VjaGVzICYmICghZS5vcmlnaW5hbEV2ZW50IHx8ICFlLm9yaWdpbmFsRXZlbnQudG91Y2hlcykpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG5cbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGdldEV2ZW50WChlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkRGlmZicsIGRpZmYpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3MoZ2V0RWxlbWVudCgnaHRtbCcpLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgXG4gICAgICB0aGlzLmhhbmRsZVRvdWNoTW92ZShlKVxuICAgICAgaWYgKHRoaXMuZ2V0KCdzd2lwZURpcmVjdGlvbicpID09ICd2JykgcmV0dXJuXG4gICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgbGV0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuICAgICAgbGV0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggKz0gTWF0aC5yb3VuZCgwLjIgKiBzY3JvbGxiYXJSZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhclJlc3VsdCA9IDBcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJlc3VsdCA+IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCAtPSBNYXRoLnJvdW5kKDAuOCAqIChyZXN1bHQgLSBsaW1pdFJpZ2h0KSAqIHNjcm9sbGJhckZhY3RvcilcbiAgICAgICAgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW92ZUV2ZW50VFMnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuICAgICAgdGhpcy5wdXNoKCdwYWdlWCcsIGN1cnJlbnRQYWdlWClcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PSAndicpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgICAgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgbnVsbClcbiAgICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG4gICAgICBjb25zdCB0aW1lRGVsdGEgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHRoaXMuZ2V0KCdtb3ZlRXZlbnRUUycpKSAvIDEuNVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogOClcblxuICAgICAgLy8gY2xpY2tlZFxuICAgICAgaWYgKGxhc3RQYWdlWCA9PT0gMCkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcub25DbGljaykgcmV0dXJuIHRoaXMuY29uZmlnLm9uQ2xpY2soZSlcblxuICAgICAgICBjb25zdCBsaW5rTm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgICBpZiAoIWxpbmtOb2RlKSByZXR1cm5cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpXG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICBjb25zdCBjdHJsQ2xpY2sgPSBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5XG5cbiAgICAgICAgaWYgKGN0cmxDbGljaykgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICAgIGlmICghdGFyZ2V0ICYmIGhyZWYpIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWZcbiAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKCdibGFuaycpID4gLTEgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICB9XG5cbiAgICAgIC8vIGRyYWdnZWRcbiAgICAgIC8vIHN0aWNreSBsZWZ0XG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIGxlZnRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTApXG4gICAgICAvLyBzdGlja3kgcmlnaHRcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIHJpZ2h0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTApXG4gICAgICAvLyBvdGhlcndpc2VcbiAgICAgIGVsc2UgaWYgKHRpbWVEZWx0YSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLnJvdW5kKE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpIC8gdGltZURlbHRhKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIE1hdGgucm91bmQoZW5kcG9pbnQpLCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkNsaWNrTGluayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gZVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGwoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS5kZWx0YVggfHwgTWF0aC5hYnMoZS5kZWx0YVkpID4gTWF0aC5hYnMoZS5kZWx0YVgpIHx8ICAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCB7ZGVsdGFYfSA9IGVcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZGVsdGFYLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcblxuICAgICAgaWYgKHJlc3VsdCA9PSBsaW1pdFJpZ2h0KSB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICBlbHNlIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICBcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcbiAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCB0cnVlKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHNjcm9sbENsaWNrRGlzYWJsZWQgPSB0aGlzLmdldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcpXG5cbiAgICAgIGlmIChzY3JvbGxDbGlja0Rpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgZmFsc2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIWUucHJldmVudERlZmF1bHQgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjYldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IGxpbWl0UmlnaHQgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgcGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGNlbnRlciA9IHBhZ2VYIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCBsZWZ0RWRnZSA9IGNlbnRlciAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgcmlnaHRFZGdlID0gY2VudGVyICsgc2NiV2lkdGggLyAyXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IGNlbnRlciAvIHNjYkZhY3RvclxuICAgICAgaWYgKGxlZnRFZGdlIDwgbGltaXRMZWZ0KSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocmlnaHRFZGdlID4gcmlnaHRTY2JMaW1pdCkgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG5cbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBcbiAgICBvbkFuY2hvckNsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUudGFyZ2V0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm4gXG4gICAgICBcbiAgICAgIGNvbnN0IGFuY2hvcmlkID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtYW5jaG9yaWRdJykuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcmlkJylcbiAgICAgIGlmICghYW5jaG9yaWQpIHJldHVyblxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcm9yaWdpbmlkPVwiJyArIGFuY2hvcmlkICsgJ1wiXScsIHJvb3ROb2RlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KHRhcmdldE5vZGUub2Zmc2V0TGVmdCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGlmIChNYXRoLmFicyhlbmRwb2ludCkgPCAyKSBlbmRwb2ludCA9IDBcblxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJEb3duKGUpIHtcbiAgICAgIGlmICghZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgdGhpcy5yZWxlYXNlU2NiKClcblxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRG93blBhZ2VYJywgY3VycmVudFBhZ2VYIC0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3IpXG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJEb3duUGFnZVggPSB0aGlzLmdldCgnc2Nyb2xsYmFyRG93blBhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBkZWx0YSA9IChjdXJyZW50UGFnZVggLSBzY3JvbGxiYXJEb3duUGFnZVgpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heChkZWx0YSAvIHNjcm9sbGJhckZhY3RvciwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgaGFuZGxlVG91Y2hTdGFydChlKSB7XG4gICAgICBpZiAoIWUudG91Y2hlcyAmJiAhZS5vcmlnaW5hbEV2ZW50KSByZXR1cm5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCBlLnRvdWNoZXNbMF0uY2xpZW50WCB8fCBlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5jbGllbnRYKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIGUudG91Y2hlc1swXS5jbGllbnRZIHx8IGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLmNsaWVudFkpXG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHRvdWNoWCA9IHRoaXMuZ2V0KCd0b3VjaFgnKVxuICAgICAgY29uc3QgdG91Y2hZID0gdGhpcy5nZXQoJ3RvdWNoWScpXG4gICAgICBpZiAoIXRvdWNoWCB8fCAhdG91Y2hZIHx8ICghZS50b3VjaGVzICYmICFlLm9yaWdpbmFsRXZlbnQpKSByZXR1cm5cblxuICAgICAgY29uc3QgeFVwID0gZS50b3VjaGVzWzBdLmNsaWVudFggfHwgZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WFxuICAgICAgY29uc3QgeVVwID0gZS50b3VjaGVzWzBdLmNsaWVudFkgfHwgZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxuXG4gICAgICBjb25zdCB4RGlmZiA9IHRvdWNoWCAtIHhVcFxuICAgICAgY29uc3QgeURpZmYgPSB0b3VjaFkgLSB5VXBcblxuICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSkgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ2gnKVxuICAgICAgZWxzZSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAndicpXG5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCAwKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIDApXG4gICAgfVxuXG5cbiAgICBhbmltYXRlKHN0YXJ0LCBzdG9wPTAsIHNwZWVkPTEwLCBhbmltYXRlV2lkdGg9ZmFsc2UpIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gc3RvcCAtIHN0YXJ0XG4gICAgICBjb25zdCB0aW1lID0gTWF0aC5tYXgoLjA1LCBNYXRoLm1pbihNYXRoLmFicyhkZWx0YSkgLyBzcGVlZCwgMSkpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSBzcGVlZCA9PSAwID8gMSA6IDAsXG4gICAgICAgICAgZW5kcG9pbnQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSxcbiAgICAgICAgICBzY2JFbmRwb2ludCA9IGVuZHBvaW50ICogc2NiRmFjdG9yXG5cbiAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmdldCgncG9pbnRlckRvd24nKSB8fCB0aGlzLmdldCgnbW91c2VTY3JvbGwnKSkgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudFRpbWUgKz0gKDEgLyA2MClcbiAgICAgICAgZW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKVxuICAgICAgICAgIDogc3RvcFxuXG4gICAgICAgIHNjYkVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCAqIHNjYkZhY3RvciArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkgKiBzY2JGYWN0b3JcbiAgICAgICAgICA6IHN0b3AgKiBzY2JGYWN0b3JcbiAgICAgICAgXG4gICAgICAgIHNjYkVuZHBvaW50ID0gTWF0aC5taW4oc2NiRW5kcG9pbnQsIHJpZ2h0U2NiTGltaXQpXG5cbiAgICAgICAgaWYgKCFhbmltYXRlV2lkdGgpIHtcbiAgICAgICAgICBpZiAoc2NiRW5kcG9pbnQgPj0gcmlnaHRTY2JMaW1pdCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgICAgICB0aGlzLnNldFNjYlBvcyhzY2JFbmRwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgc2NidyA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICAgICAgaWYgKHN0YXJ0IDwgc3RvcCkgc2NidyAtPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG4gICAgICAgICAgZWxzZSBzY2J3ICs9IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcblxuICAgICAgICAgIHRoaXMuc2V0V2lkdGgoc2NidylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zKC0xICogZW5kcG9pbnQpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIGVuZHBvaW50KVxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA8IDEpIHJhZih0aWNrKVxuICAgICAgICBlbHNlIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpY2soKVxuICAgIH1cblxuICAgIGNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHNjcm9sbGVkID4gbGltaXRMZWZ0KSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gcHVibGljIEFQSVxuXG4gICAgc2Nyb2xsVG8ocG9pbnQsIHRpbWU9MTAwMCkge1xuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgbGV0IGVuZHBvaW50ID0gIWlzTmFOKHBvaW50KSA/IHBhcnNlSW50KHBvaW50KSA6IDBcbiAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgoZW5kcG9pbnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGlmIChwb2ludCA9PSAnZW5kJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnc3RhcnQnKSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ2NlbnRlcicpIGVuZHBvaW50ID0gbGltaXRSaWdodCAvIDJcblxuICAgICAgdGhpcy5hbmltYXRlKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBlbmRwb2ludCwgdGltZSlcbiAgICB9XG5cbiAgICB1cGRhdGUoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPXRoaXMuY29uZmlnLmFsaWduLFxuICAgICAgICBub0FuY2hvcnM9dGhpcy5jb25maWcubm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcj10aGlzLmNvbmZpZy5ub1Njcm9sbGJhcixcbiAgICAgICAgb25DbGljaz10aGlzLmNvbmZpZy5vbkNsaWNrLFxuICAgICAgICBzdGFydD10aGlzLmNvbmZpZy5zdGFydCxcbiAgICAgICAgc3RhcnRBbmltRHVyYXRpb249dGhpcy5jb25maWcuc3RhcnRBbmltRHVyYXRpb24sXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnLmFsaWduID0gYWxpZ25cbiAgICAgIHRoaXMuY29uZmlnLm5vQW5jaG9ycyA9IG5vQW5jaG9yc1xuICAgICAgdGhpcy5jb25maWcubm9TY3JvbGxiYXIgPSBub1Njcm9sbGJhclxuICAgICAgdGhpcy5jb25maWcub25DbGljayA9IG9uQ2xpY2tcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0QW5pbUR1cmF0aW9uID0gc3RhcnRBbmltRHVyYXRpb25cbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gc3RhcnRcblxuICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdCBjb25maWdcblxuICBjb25zdCBhdXRvaW5pdCA9ICgpID0+IHtcbiAgICBjb25zdCBlbHMgPSBnZXRFbGVtZW50cygnLnNjcm9sbGVyJylcbiAgICBBcnJheS5mcm9tKGVscykuZm9yRWFjaChlbCA9PiB7XG4gICAgICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBhdXRvaW5pdClcblxuICBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJpbnRlcmFjdGl2ZVwiKSBhdXRvaW5pdCgpXG4gIH1cblxuICB3aW5kb3cuU2Nyb2xsZXIgPSBTY3JvbGxlclxuXG59KCkpXG4iLCJtb2R1bGUuZXhwb3J0cyA9ICh0eXBlb2YgQXJyYXkuZnJvbSA9PT0gJ2Z1bmN0aW9uJyA/XG4gIEFycmF5LmZyb20gOlxuICByZXF1aXJlKCcuL3BvbHlmaWxsJylcbik7XG4iLCIvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1hcnJheS5mcm9tXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbihmbikge1xuICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7XG4gIH07XG4gIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gMDsgfVxuICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHsgcmV0dXJuIG51bWJlcjsgfVxuICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICB9O1xuICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xuICB9O1xuICB2YXIgaXRlcmF0b3JQcm9wID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZih2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBpZihbJ3N0cmluZycsJ251bWJlcicsJ2Jvb2xlYW4nLCdzeW1ib2wnXS5pbmRleE9mKHR5cGVvZiB2YWx1ZSkgPiAtMSl7XG4gICAgICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICgnaXRlcmF0b3InIGluIFN5bWJvbCkgJiZcbiAgICAgICAgKFN5bWJvbC5pdGVyYXRvciBpbiB2YWx1ZSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfVxuICAgICAgLy8gU3VwcG9ydCBcIkBAaXRlcmF0b3JcIiBwbGFjZWhvbGRlciwgR2Vja28gMjcgdG8gR2Vja28gMzVcbiAgICAgIGVsc2UgaWYgKCdAQGl0ZXJhdG9yJyBpbiB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gJ0BAaXRlcmF0b3InO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKE8sIFApIHtcbiAgICAvLyBBc3NlcnQ6IElzUHJvcGVydHlLZXkoUCkgaXMgdHJ1ZS5cbiAgICBpZiAoTyAhPSBudWxsICYmIFAgIT0gbnVsbCkge1xuICAgICAgLy8gTGV0IGZ1bmMgYmUgR2V0VihPLCBQKS5cbiAgICAgIHZhciBmdW5jID0gT1tQXTtcbiAgICAgIC8vIFJldHVybklmQWJydXB0KGZ1bmMpLlxuICAgICAgLy8gSWYgZnVuYyBpcyBlaXRoZXIgdW5kZWZpbmVkIG9yIG51bGwsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZihmdW5jID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIC8vIElmIElzQ2FsbGFibGUoZnVuYykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZ1bmMgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuYztcbiAgICB9XG4gIH07XG4gIHZhciBpdGVyYXRvclN0ZXAgPSBmdW5jdGlvbihpdGVyYXRvcikge1xuICAgIC8vIExldCByZXN1bHQgYmUgSXRlcmF0b3JOZXh0KGl0ZXJhdG9yKS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChyZXN1bHQpLlxuICAgIHZhciByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgLy8gTGV0IGRvbmUgYmUgSXRlcmF0b3JDb21wbGV0ZShyZXN1bHQpLlxuICAgIC8vIFJldHVybklmQWJydXB0KGRvbmUpLlxuICAgIHZhciBkb25lID0gQm9vbGVhbihyZXN1bHQuZG9uZSk7XG4gICAgLy8gSWYgZG9uZSBpcyB0cnVlLCByZXR1cm4gZmFsc2UuXG4gICAgaWYoZG9uZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oaXRlbXMgLyosIG1hcEZuLCB0aGlzQXJnICovICkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgIHZhciBDID0gdGhpcztcblxuICAgIC8vIDIuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG5cbiAgICB2YXIgVDtcbiAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gMy4gZWxzZVxuICAgICAgLy8gICBhLiBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbidcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gICBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVFxuICAgICAgLy8gICAgICBiZSB1bmRlZmluZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cbiAgICAgIC8vICAgYy4gTGV0IG1hcHBpbmcgYmUgdHJ1ZSAoaW1wbGllZCBieSBtYXBGbilcbiAgICB9XG5cbiAgICB2YXIgQSwgaztcblxuICAgIC8vIDQuIExldCB1c2luZ0l0ZXJhdG9yIGJlIEdldE1ldGhvZChpdGVtcywgQEBpdGVyYXRvcikuXG4gICAgLy8gNS4gUmV0dXJuSWZBYnJ1cHQodXNpbmdJdGVyYXRvcikuXG4gICAgdmFyIHVzaW5nSXRlcmF0b3IgPSBnZXRNZXRob2QoaXRlbXMsIGl0ZXJhdG9yUHJvcChpdGVtcykpO1xuXG4gICAgLy8gNi4gSWYgdXNpbmdJdGVyYXRvciBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHVzaW5nSXRlcmF0b3IgIT09IHZvaWQgMCkge1xuICAgICAgLy8gYS4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAgIGkuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXVxuICAgICAgLy8gICAgICBpbnRlcm5hbCBtZXRob2Qgb2YgQyB3aXRoIGFuIGVtcHR5IGFyZ3VtZW50IGxpc3QuXG4gICAgICAvLyBiLiBFbHNlLFxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIHRoZSBhYnN0cmFjdCBvcGVyYXRpb24gQXJyYXlDcmVhdGVcbiAgICAgIC8vICAgICAgd2l0aCBhcmd1bWVudCAwLlxuICAgICAgLy8gYy4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQygpKSA6IFtdO1xuXG4gICAgICAvLyBkLiBMZXQgaXRlcmF0b3IgYmUgR2V0SXRlcmF0b3IoaXRlbXMsIHVzaW5nSXRlcmF0b3IpLlxuICAgICAgdmFyIGl0ZXJhdG9yID0gdXNpbmdJdGVyYXRvci5jYWxsKGl0ZW1zKTtcblxuICAgICAgLy8gZS4gUmV0dXJuSWZBYnJ1cHQoaXRlcmF0b3IpLlxuICAgICAgaWYgKGl0ZXJhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZi4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuXG4gICAgICAvLyBnLiBSZXBlYXRcbiAgICAgIHZhciBuZXh0LCBuZXh0VmFsdWU7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAvLyBpLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgIC8vIGlpLiBMZXQgbmV4dCBiZSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpLlxuICAgICAgICAvLyBpaWkuIFJldHVybklmQWJydXB0KG5leHQpLlxuICAgICAgICBuZXh0ID0gaXRlcmF0b3JTdGVwKGl0ZXJhdG9yKTtcblxuICAgICAgICAvLyBpdi4gSWYgbmV4dCBpcyBmYWxzZSwgdGhlblxuICAgICAgICBpZiAoIW5leHQpIHtcblxuICAgICAgICAgIC8vIDEuIExldCBzZXRTdGF0dXMgYmUgU2V0KEEsIFwibGVuZ3RoXCIsIGssIHRydWUpLlxuICAgICAgICAgIC8vIDIuIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICAgICAgQS5sZW5ndGggPSBrO1xuXG4gICAgICAgICAgLy8gMy4gUmV0dXJuIEEuXG4gICAgICAgICAgcmV0dXJuIEE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdi4gTGV0IG5leHRWYWx1ZSBiZSBJdGVyYXRvclZhbHVlKG5leHQpLlxuICAgICAgICAvLyB2aS4gUmV0dXJuSWZBYnJ1cHQobmV4dFZhbHVlKVxuICAgICAgICBuZXh0VmFsdWUgPSBuZXh0LnZhbHVlO1xuXG4gICAgICAgIC8vIHZpaS4gSWYgbWFwcGluZyBpcyB0cnVlLCB0aGVuXG4gICAgICAgIC8vICAgMS4gTGV0IG1hcHBlZFZhbHVlIGJlIENhbGwobWFwZm4sIFQsIMKrbmV4dFZhbHVlLCBrwrspLlxuICAgICAgICAvLyAgIDIuIElmIG1hcHBlZFZhbHVlIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vICAgMy4gTGV0IG1hcHBlZFZhbHVlIGJlIG1hcHBlZFZhbHVlLltbdmFsdWVdXS5cbiAgICAgICAgLy8gdmlpaS4gRWxzZSwgbGV0IG1hcHBlZFZhbHVlIGJlIG5leHRWYWx1ZS5cbiAgICAgICAgLy8gaXguICBMZXQgZGVmaW5lU3RhdHVzIGJlIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgLy8gICAgICBDcmVhdGVEYXRhUHJvcGVydHlPclRocm93KEEsIFBrLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vIHguIFtUT0RPXSBJZiBkZWZpbmVTdGF0dXMgaXMgYW4gYWJydXB0IGNvbXBsZXRpb24sIHJldHVyblxuICAgICAgICAvLyAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBkZWZpbmVTdGF0dXMpLlxuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gbWFwRm4uY2FsbChULCBuZXh0VmFsdWUsIGspO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIEFba10gPSBuZXh0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8geGkuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgICAgaysrO1xuICAgICAgfVxuICAgICAgLy8gNy4gQXNzZXJ0OiBpdGVtcyBpcyBub3QgYW4gSXRlcmFibGUgc28gYXNzdW1lIGl0IGlzXG4gICAgICAvLyAgICBhbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyA4LiBMZXQgYXJyYXlMaWtlIGJlIFRvT2JqZWN0KGl0ZW1zKS5cbiAgICAgIHZhciBhcnJheUxpa2UgPSBPYmplY3QoaXRlbXMpO1xuXG4gICAgICAvLyA5LiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoaXRlbXMgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlbiBiZSBUb0xlbmd0aChHZXQoYXJyYXlMaWtlLCBcImxlbmd0aFwiKSkuXG4gICAgICAvLyAxMS4gUmV0dXJuSWZBYnJ1cHQobGVuKS5cbiAgICAgIHZhciBsZW4gPSB0b0xlbmd0aChhcnJheUxpa2UubGVuZ3RoKTtcblxuICAgICAgLy8gMTIuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIENvbnN0cnVjdChDLCDCq2xlbsK7KS5cbiAgICAgIC8vIDEzLiBFbHNlXG4gICAgICAvLyAgICAgYS4gTGV0IEEgYmUgQXJyYXlDcmVhdGUobGVuKS5cbiAgICAgIC8vIDE0LiBSZXR1cm5JZkFicnVwdChBKS5cbiAgICAgIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XG5cbiAgICAgIC8vIDE1LiBMZXQgayBiZSAwLlxuICAgICAgayA9IDA7XG4gICAgICAvLyAxNi4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGFycmF5TGlrZVtrXTtcbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDE3LiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgLy8gMTguIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICBBLmxlbmd0aCA9IGxlbjtcbiAgICAgIC8vIDE5LiBSZXR1cm4gQS5cbiAgICB9XG4gICAgcmV0dXJuIEE7XG4gIH07XG59KSgpO1xuIl19