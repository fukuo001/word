/**
 * uiFunction
 */

export class uiFunction {
    private static uifunc: uiFunction = null;
    constructor() {

    }

    /**
     * getInstance
     */
    public static getInstance(): uiFunction {
        if (this.uifunc === null) {
            this.uifunc = new uiFunction();
        }
        return this.uifunc;
    }

    /**
         * _obj 需要存储控件名的对象
         * _node 需要绑定的node
         */
    bindControl(_obj: object, _node: cc.Node) {
        for (let index = 0; index < _node.children.length; index++) {
            if (_node.children[index].children.length > 0) {
                this.bindControl(_obj, _node.children[index]);
            }

            if (_node.children[index].name.indexOf("_Node") !== -1) {
                _obj[_node.children[index].name] = _node.children[index];
            } else if (_node.children[index].name.indexOf("_Label") !== -1) {
                _obj[_node.children[index].name] = _node.children[index].getComponent(cc.Label);
            } else if (_node.children[index].name.indexOf("_Sprite") !== -1) {
                _obj[_node.children[index].name] = _node.children[index].getComponent(cc.Sprite);
            } else if (_node.children[index].name.indexOf("_Toggle") !== -1) {
                _obj[_node.children[index].name] = _node.children[index].getComponent(cc.Toggle);
            }
        }
    }
}

