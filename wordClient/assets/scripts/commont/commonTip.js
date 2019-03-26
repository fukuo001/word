cc.Class({
    extends: cc.Component,
 
    properties: {
    
        label: {
            default: null,
            type: cc.Label
        }
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    onDestroy: function () {
        this.unscheduleAllCallbacks();
    },

    init: function (_data) {
        this.unscheduleAllCallbacks();
        // this.node.active = true;
        this.label.string = _data.txt;
        // this.bg.node.width = this.label.node.width + 20;

        var duration = _data.time || 2;
        this.scheduleOnce(() => {
            // YY.UIManager.close('commonTip');
            this.node.active = false;
        }, duration);
    },
});

