
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    _tableData:object = [];
    start () {

    }

    /**
     * initTableView
     */
    public initTableView(_data:object) {
        this._tableData = _data;
        
    }

    /**
     * updateData
     */
    public updateData(_data:object, _ref:boolean = false) {
        
    }

    // update (dt) {}
}
