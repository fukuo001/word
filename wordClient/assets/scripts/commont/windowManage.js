(function () {
    window.client = window.client || {};
    client.WindowManage = {
        _loadEndWindow:{},
        _currentWindow:null,
        _currentWindowSrc: null,
        _windowList:[],
        _defaultWindow:'signInWnd',
        
        
        /**
         * 加载界面
         */
        loadWindow:function (name, isPush = true) {
            var that = this;
            var wndData = client.wndMap[name];
            var src = wndData.src;
            isPush  && this.pushWindow(name);
            if (that._loadEndWindow[name] === undefined || that._loadEndWindow[name].isValid === false){
                that._currentWindowSrc = name;
                cc.loader.loadRes(src, function (err, prefab) {
                    if (err) {
                        return;
                    }
                    if ((that._loadEndWindow[name] === undefined || that._loadEndWindow[name].isValid === false) && (name === that._currentWindowSrc || that._currentWindowSrc === '')){
                        var time = that.hideCurrentWindow();
                        setTimeout(() => {
                            
                            that._currentWindow = cc.instantiate(prefab);
                            that._loadEndWindow[name] = that._currentWindow;
                            cc.director.getScene().getChildByName('Canvas').getChildByName('Node').addChild(that._currentWindow);
                        }, time * 1000);
                        
                    }
                });
            }else{
                if (this._currentWindowSrc !== name){
                    var time = this.hideCurrentWindow();
                    setTimeout(() => {
                        this._loadEndWindow[name].active = true;
                        this._currentWindow = this._loadEndWindow[name];
                        this._currentWindowSrc = src; 
                    },time * 1000 );
                    
                }

            }
        },

        pushWindow:function (name) {
            this.popWindow(name);
            this._windowList.push(name);
        },

        popWindow:function (name) {
            var index = this._windowList.indexOf(name)
            index >-1 && this._windowList.splice(index, 1);
        },

        backWindow:function () {
            var name = this._windowList.pop();
            name === undefined && (name = "signInWnd");
            this.loadWindow(this._windowList[this._windowList.length - 1]);
        },
        
        hideCurrentWindow:function () {
            var time = 0;
            if (this._currentWindow !== null && cc.isValid(this._currentWindow)){
                var animCtr =  this._currentWindow.getComponent('wndAnimation');
                if(animCtr){
                    time = animCtr.getHideTime();
                    animCtr.onAnimHideWindow();
                }else{
                    this._currentWindow.active = false;
                }
            }
            return time;
        },

        clearList:function () {
            this._windowList = [];
        },

        /**
         * 销毁函数
         */
        destroy: function () {
            for (const key in this._loadEndWindow) {
                const element = this._loadEndWindow[key];
                if (element !== undefined){
                    element.destroy();
                }
            }
            this._loadEndWindow = {};
            this._windowList = [];
            this._currentWindow = null;
            this._currentWindowSrc = '';
        },
    }
})();

// 监听场景变化
cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
    // YY.WindowManage.destroy();
});