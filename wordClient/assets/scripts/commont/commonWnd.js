/**
 * YY.uiFuncs.showCommonWnd({
 *      noEmptyClose: true,             // 默认点击空白区域关闭弹窗；此值为true时，点击空白区域不会关闭弹窗
 *      des: "您的余额不足，请及时充值",    // 提示描述文字
 *      buttons: [{                     // 展示一个或者两个按钮，可针对每个按钮定义点击事件，callback
 *          content: "取消",
 *      }, {
 *          content: "确定",
 *          callback: () => {},
 *      }]
 * })
 */
cc.Class({
    extends: cc.Component,

    properties: {
        btnNodes: [cc.Node],
        btnLabels: [cc.Label],
        desLabel:cc.Label,
        titel:cc.Label,
    },

    
    onLoad: function () {
        this._default = {
            title:'温馨提示',
            desc:'',
        }
    },

    init:function (_data) {
        this.data = _data;
        // this.node.active = true;
        this.titel.string = _data.title || this._default.titel;
        this.desLabel.string = _data.desc || this._default.desc;
        this.onShowBtn(_data.buttons);
    },

    onRightBtnClick:function () {
        this._close();
        if(this.data.buttons[0] && this.data.buttons[0].callback){
            this.data.buttons[0].callback();
        }
    },

    onCloseBtnClick:function () {
        this._close();
        this.data.close && this.data.close();
    },

    onShowBtn:function (_btns) {
        this.btnLabels[0].string = (_btns[0] && _btns[0].content) ? _btns[0].content : "确定";
        // switch (_btns.length) {
        //     case 0:
        //         this.btnNodes[0].active = false;
        //         this.btnNodes[1].active = false;
        //         break;
        //     case 1:
        //         this.btnNodes[1].active = true;
        //         this.btnNodes[1].x = 0;
        //         this.btnLabels[1].string = _btns[0].content;

        //         break;
        //     case 2:
        //         this.btnNodes[0].active = true;
        //         this.btnNodes[0].x = 110;
        //         this.btnLabels[0].string = _btns[0].content;
        //         this.btnNodes[1].active = true;
        //         this.btnNodes[1].x = -110;
        //         this.btnLabels[1].string = _btns[1].content;
        //         break;
        //     default:
        //         break;
        // }

    },

    onDestroy:function () {
        
    },

    _close(){
        // YY.UIManager.close('commonWnd');
        this.node.active = false;
    },

});
