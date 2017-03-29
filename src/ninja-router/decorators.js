function onUse(fnArray) {
  return function(target, key, descriptor) {
    let originOnCreate = descriptor.value;
    if (!descriptor.$originOnCreate) {
      descriptor.$originOnCreate = originOnCreate;
    }
    descriptor.value = function(opts) {
      if (
        descriptor.$originOnCreate &&
        !descriptor.$originOnCreateInvocated
      ) {
        descriptor.$originOnCreate.apply(this, [opts])
        descriptor.$originOnCreateInvocated = true;
      }
      if (!this.$mws || !this.$mws.length) {
        this.mixin('router');
      }
      this.one('leave', () => {
        descriptor.$originOnCreateInvocated = false;
      })
      this.one('unmount', () => {
        descriptor.$originOnCreateInvocated = false;
      })
      if (!Array.isArray(fnArray)) {
        fnArray = [fnArray]
      }
      fnArray.forEach(fn => {
        this.$use((next, ctx) => {
          if (typeof fn === 'string') {
            fn = this.opts[fn];
            if (!fnArray) {
              invariant(`[onUse]: Error not such a ${fnArray} in opts`)
            }
          }
          return fn.apply(this, [next, ctx, this])
        });
      })
    }
    return descriptor;
  }
}

export default {
	onUse
}