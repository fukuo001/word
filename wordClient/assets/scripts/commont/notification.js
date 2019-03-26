// created by zengxx on 2018-01-23

(function () {
    window.notification = (function () {
        var events = {};

        return {
            listen: function (eName, handler, scope) {
                if (typeof (handler) == 'undefined') return;

                events[eName] = events[eName] || [];
                events[eName].push({
                    scope: scope || this,
                    handler: handler
                });
                return handler; //返回回调函数的handler
            },

            listenOnce: function (eName, handler, scope) {
                if (!eName || !handler) {
                    return;
                }
                events[eName] = events[eName] || [];
                events[eName].push({
                    scope: scope || this,
                    handler: handler,
                    once: true
                })
                return handler;
            },

            ignore: function (eName, handler, scope) {
                scope = scope || this;
                var fns = events[eName]

                if (!fns)
                    return;

                events[eName] = fns.filter(function (fn) {
                    if (typeof (fn) != 'undefined') {
                        return fn.scope != scope || fn.handler != handler;
                    }
                });
            },

            ignoreAll: function (_scope) {
                if (!_scope) {
                    throw new Error('take care , NotificationCenter function ignoreAll needs a parameter!');
                    return;
                };
                for (var eName in events) {
                    var fns = events[eName]
                    if (!fns) continue;

                    events[eName] = fns.filter(function (fn) {
                        var ret = fn.scope != _scope;
                        if (!ret) {//log 释放的事件
                            cc.log(_scope._TAG + " 释放 " + eName)
                        };
                        return ret
                    });
                };
            },

            trigger: function (eventName, params) {
                var fns = events[eventName], i, fn;

                if (!fns) {
                    return;
                }

                var ___additional = { name: eventName }; // 附加参数add by likai
                for (i = 0; fn = fns[i]; i++) {
                    if (typeof (fn) != 'undefined') {
                        if (fn.scope.node !== undefined ){
                            
                            if (cc.isValid(fn.scope.node) === true){
                                fn.handler.call(fn.scope, params, ___additional);
                                if (fn.once) {
                                    fns.splice(i, 1);
                                    --i;
                                }
                            }
                        }else{
                            fn.handler.call(fn.scope, params, ___additional);
                            if (fn.once) {
                                fns.splice(i, 1);
                                --i;
                            }
                        }
                    }
                }
            },

            // 获取当前事件有多少个观察者
            count: function (eventName) {
                events[eventName] = events[eventName] || [];
                return events[eventName].length;
            }
        };
    })();
})();
