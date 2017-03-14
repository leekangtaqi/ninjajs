'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function onUse(fnArray) {
  return function (target, key, descriptor) {
    var originOnCreate = descriptor.value;
    if (!descriptor.$originOnCreate) {
      descriptor.$originOnCreate = originOnCreate;
    }
    descriptor.value = function (opts) {
      var _this = this;

      if (descriptor.$originOnCreate && !descriptor.$originOnCreateInvocated) {
        descriptor.$originOnCreate.apply(this, [opts]);
        descriptor.$originOnCreateInvocated = true;
      }
      if (!this.$mws || !this.$mws.length) {
        this.mixin('router');
      }
      this.one('leave', function () {
        descriptor.$originOnCreateInvocated = false;
      });
      this.one('unmount', function () {
        descriptor.$originOnCreateInvocated = false;
      });
      if (!Array.isArray(fnArray)) {
        fnArray = [fnArray];
      }
      fnArray.forEach(function (fn) {
        _this.$use(function (next, ctx) {
          if (typeof fn === 'string') {
            fn = _this.opts[fn];
            if (!fnArray) {
              invariant('[onUse]: Error not such a ' + fnArray + ' in opts');
            }
          }
          return fn.apply(_this, [next, ctx, _this]);
        });
      });
    };
    return descriptor;
  };
}

exports.default = {
  onUse: onUse
};