/**
 * 比赛窗口创建工厂类
 */

(function () {
    window.client = window.client || {};
    client.WindowFactory = {
        _TAG: 'WindowFactory',

        /**
         * 注册窗口统一格式,放到windowKeyMap中,数据格式{claseName:{src:路径}}
         * type包括:
         * replace  关闭原来窗口,开启新的
         * refresh  不存在创建新窗口,存在时，执行init 
         * repeat   创建新窗口,允许窗口存在多个
         */
        _initWindowKeyMap: function () {

        },

        _registerWindow: function () {
            
        },

        popWindow: function (name, params) {
            let className = name,
                eventData = client.wndMap[name],
                src = eventData.src,
                parent = cc.director.getScene();

            if (!parent) {
                return
            }

            if (eventData.type == "replace") {
                var form = parent.getChildByName(className);
                if (form) {
                    form.removeFromParent(true);
                }
                cc.loader.loadRes(src, function (err, prefab) {
                    if (err) {
                        return;
                    }
                    let addNode = cc.instantiate(prefab)
                    let script = addNode.getComponent(className);

                    parent.addChild(addNode, eventData.ZOrder ? eventData.ZOrder : 0);
                    script && script.init && script.init(params);
                })
            }
            else if (eventData.type == "refresh") {
                var form = parent.getChildByName(className);
                if (!form) {
                    cc.loader.loadRes(src, function (err, prefab) {
                        if (err) {
                            return;
                        }
                        let addNode = cc.instantiate(prefab)
                        parent.addChild(addNode, eventData.ZOrder ? eventData.ZOrder : 0);
                        let script = addNode.getComponent(className);
                        script && script.init && script.init(params);
                    })
                } else {
                    form.active = true;
                    let script = form.getComponent(className);
                    script && script.init && script.init(params);
                }
            }
            else if (eventData.type == "repeat") {
                cc.loader.loadRes(src, function (err, prefab) {
                    if (err) {
                        return;
                    }
                    let addNode = cc.instantiate(prefab)
                    let script = addNode.getComponent(className);
                    script && script.init && script.init(params);
                    parent.addChild(cc.instantiate(prefab), eventData.ZOrder ? eventData.ZOrder : 0);
                })
            }
        },

        _hideWindow: function (params) {
            var time = 0;
            let className = params.name,
                parent = cc.director.getScene();
            if (!parent) {
                return time;
            }
            var form = parent.getChildByName(className);
            if (form) {
                var  script = form.getComponent('wndAnimation');
                if(script){
                    time = animCtr.getHideTime();
                    animCtr.onAnimHideWindow();
                }else{
                    form.removeFromParent(true);
                }
            }
            return time;
        }

        
    };
    client.WindowFactory._initWindowKeyMap();
})();
