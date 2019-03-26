const { ccclass, property } = cc._decorator;
import { tableCell } from "./tableCell";
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    content: cc.Node = null;

    _baseCell: cc.Node = null;
    _cellList: Array<cc.Node> = [];
    _cellWidth: number = 0;
    _cellHeight: number = 0;
    _rows: number = 0;
    _columns: number = 0;
    _prefab: cc.Prefab = null;

    _oldPos: cc.Vec2 = cc.v2(0, 0);
    _params: object = null;

    data: object = {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this._data = this._data || { dataList: [] };
            if (Array.isArray(value)) {
                this._data.dataList = value;
            } else {
                this._data = value;
            }
        }
    }

    start() {

    }

    init(params: object, data: object) {
        this._params = params;
        this.data = {
            "dataList": []
        };

        if (data) {
            this.data = data;
        }

        var cellPrefab = this._params["cellPrefab"];
        var alignment = this._params["alignment"] || 'vertical';

        this.scrollView.horizontal = alignment === 'horizontal';
        this.scrollView.vertical = alignment === 'vertical';

        if (this.scrollView.vertical) {
            this.content.width = this.node.width;
        } else {
            this.content.height = this.node.height;
        }

        var loadDone = function (err, prefab) {
            if (err || cc.isValid(this.content) === false) {
                return
            }
            var node = cc.instantiate(prefab);
            this.content.addChild(node);
            node.active = false;
            this._baseCell = node;
            this._prefab = prefab;

            cc.director.once(cc.Director.EVENT_BEFORE_DRAW, this.initCells, this);
        }.bind(this);

        var prefab = cc.loader.getRes(cellPrefab);
        if (prefab) {
            loadDone(null, prefab);
        } else {
            cc.loader.loadRes(cellPrefab, loadDone);
        }
    }

    initCells() {
        this._cellWidth = this._baseCell.width;
        this._cellHeight = this._baseCell.height;

        // calculate cell count
        var totalWidth = this.node.width;
        var totalHeight = this.node.height;
        var rowCount, columnCount;
        if (this.scrollView.vertical) {
            rowCount = Math.ceil(totalHeight / this._cellHeight) + 1;
            columnCount = Math.floor(totalWidth / this._cellWidth);
            columnCount < 1 && (columnCount = 1);
        } else {    // this.scrollView.horizontal
            columnCount = Math.ceil(totalWidth / this._cellWidth) + 1;
            rowCount = Math.floor(totalHeight / this._cellHeight);
            rowCount < 1 && (rowCount = 1);
        }
        this._rows = rowCount;
        this._columns = columnCount;
        var cellCount = this._rows * this._columns;

        // add to parent && push into list
        for (var i = 0; i < cellCount; ++i) {
            var node = cc.instantiate(this._prefab);
            this.content.addChild(node);
            this._cellList.push(node);
        }

        this._prefab = null;
        this._baseCell.destroy();
        this._baseCell = null;
        this.updateView(this.data, true);
    }

    updateData(data: object, doRestore: boolean) {
        if (doRestore)
            this.updateViewNicely(data);
        else
            this.updateView(data);
    }

    updateView(data: object, doDelay: boolean = false) {
        if (data) {
            this.data = data;
        }
        if (!this.data || this._cellList.length === 0) {
            return;
        }

        // stop scrolling
        if (this.scrollView.isAutoScrolling) {
            this.scrollView.stopAutoScroll();
        } else if (this.scrollView.isScrolling) {
            this.scrollView.enabled = false;
            this.scrollView.enabled = true;
        }

        if (this.scrollView.vertical) {
            var rows = Math.ceil(this.data["dataList"].length / this._columns);
            this.content.height = rows * this._cellHeight;
            this.content.width = this.node.width;
        } else {
            var columns = Math.ceil(this.data["dataList"].length / this._rows);
            this.content.width = columns * this._cellWidth;
            this.content.height = this.node.height;
        }


        var offSet = this.content.parent.height * this.content.parent.anchorY;
        if (this.scrollView.vertical) {
            this.content.active = false;
            this.scheduleOnce(() => {
                this.content.active = true;
                this.content.setPosition(0, offSet);
                cc.log('cc.node.parent.name ' + this.node.parent.name, this.content.x);

            }, 0.01)

        } else {
            var offSetX = 0 - (this.content.parent.width * this.content.parent.anchorX);
            this.content.setPosition(offSetX, offSet);
            cc.log('cc.node.parent.name ' + this.node.parent.name, this.content.x);
        }


        this._oldPos = cc.v2(0, 0);

        var spaceX = 0, spaceY = 0;
        var posX = 0;
        var posY = 0;

        if (this.scrollView.vertical) {
            spaceX = (this.content.width - this._cellWidth * this._columns) / (this._columns + 1);
        } else {
            spaceY = (this.content.height - this._cellHeight * this._rows) / (this._rows + 1);
        }

        var row = 1, column = 1;
        for (var i = 0, len = this._cellList.length; i < len; ++i) {
            var node = this._cellList[i];


            if (this.scrollView.vertical) {

                posY = -spaceY * row - (this._cellHeight * row - this._cellHeight * node.anchorY);
            } else {
                posX = spaceX * column + (this._cellWidth * column - this._cellWidth * node.anchorX) - (this.content.width * this.content.anchorX);
                posY = -spaceY * row - (this._cellHeight * row - this._cellHeight * node.anchorY);

            }
            node.setPosition(posX, posY);

            var index = i;
            if (index >= 0 && index < this.data["dataList"].length) {

                if (this._params["cellController"]) {
                    var controller = node.getComponent(tableCell);
                    if (doDelay) {
                        setTimeout(function (newNode: cc.Node, newController: tableCell, newIndex:number) {
                            newNode.active = true;
                            newController.updateCell(this.data, newIndex);
                        }.bind(this, node, controller, index), (i + 1) * 50);
                    } else {
                        // controller["updateView"](this.data, index);
                        controller.updateCell(this.data, index);
                        node.active = true;
                    }
                }
            } else {
                node.active = false;
            }

            if (this.scrollView.vertical) {
                column++;
                if (column > this._columns) {
                    row += 1;
                    column = 1;
                }
            } else {
                row++;
                if (row > this._rows) {
                    column += 1;
                    row = 1;
                }
            }
        }
    }

    updateViewNicely(data: object) {
        var prePos = this.content.position;
        var preWidth = this.content.width, preHeight = this.content.height;

        if (this.scrollView.isAutoScrolling() || this.scrollView.isScrolling()) {
            if (this.scrollView.vertical) {
                if (prePos.y < 0) {
                    prePos.y = 0;
                } else if (prePos.y > this.content.height - this.node.height) {
                    prePos.y = this.content.height - this.node.height;
                }
            } else {
                if (prePos.x > 0) {
                    prePos.x = 0;
                } else if (prePos.x + this.content.width < this.node.width) {
                    prePos.x = this.node.width - this.content.width;
                }
            }
        }

        this.updateView(data);

        var pos = cc.v2(prePos.x, prePos.y);
        if (this.scrollView.vertical) {
            if (this.content.height - prePos.y < this.node.height) {    // shrinked too much
                if (this.content.height < this.node.height) {
                    pos.y = 0;
                } else {
                    pos.y = this.content.height - this.node.height;
                }
            }
        } else {
            if (this.content.width + prePos.x < this.node.width) {  // shrinked too much
                if (this.content.width < this.node.width) {
                    pos.x = 0;
                } else {
                    pos.x = this.node.width - this.content.width;
                }
            }
        }

        // if (this.scrollView.vertical) {

        //     this.content.setPosition(0, offSet);
        // } else {
        //     var offSetX = 0 - (this.content.parent.width * this.content.parent.anchorX);
        //     this.content.setPosition(offSetX, offSet);
        // }
        this.content.setPosition(pos.x, pos.y);

        if (pos.x === 0 && pos.y === 0) {
            return;
        }

        var updateCellsR = function () {    // update positions recursively
            if (this._updateCells(-1)) {
                updateCellsR();
            }
        }.bind(this);
        updateCellsR();
    }

    _updateCells(direction: number = 0) {
        var contentOffSet = 0;
        if (this.scrollView.vertical) {
            contentOffSet = this.content.position.y - (this.content.parent.height * this.content.parent.anchorY);
            if (contentOffSet < 0 || contentOffSet + this.node.height > this.content.height) {
                return;
            }
            var posKey = 'y';
            var cellLength = this._cellHeight;
            var count = this._columns;
            var anchorKey = 'anchorY';
            var viewLength = this.node.height;
            var contentLength = this.content.height;
        } else {
            contentOffSet = this.content.position.x + (this.content.parent.width * this.content.parent.anchorX);
            if (contentOffSet > 0 || contentOffSet + this.content.width < this.node.width) {
                return;
            }
            posKey = 'x';
            cellLength = this._cellWidth;
            count = this._rows;
            anchorKey = 'anchorX';
            viewLength = this.node.width;
            contentLength = this.content.width;
        }

        var cellControllerName = this._params["cellController"];

        var head = this._cellList[0];
        var tail = this._cellList[this._cellList.length - 1];
        var headOffset = Math.abs(head.position[posKey]) + cellLength * head[anchorKey];
        var tailOffset = Math.abs(tail.position[posKey]) - cellLength * (1 - tail[anchorKey]);

        // 向后调整
        if (direction < 0 && headOffset < Math.abs(contentOffSet)) {
            for (var i = 0; i < count; ++i) {
                var node = this._cellList[0];
                var posX = posKey === 'x' ? (tail.position[posKey] + cellLength) : node.position.x;
                var posY = posKey === 'y' ? (tail.position[posKey] - cellLength) : node.position.y;
                node.setPosition(posX, posY);
                this._cellList.shift();
                this._cellList.push(node);

                var index = (tailOffset + cellLength) / cellLength * count + i;
                if (index < 0 || index >= this.data["dataList"].length) {
                    node.active = false;
                    continue;
                }
                node.active = true;
                if (cellControllerName) {
                    var controller = node.getComponent(tableCell);
                    controller.updateCell(this.data, index);
                }
            }
            return true;
        }

        // 向前调整
        else if (direction > 0 && tailOffset > Math.abs(contentOffSet) + viewLength) {
            if (headOffset === cellLength) {
                return;
            }
            for (i = 0; i < count; ++i) {
                node = this._cellList[this._cellList.length - 1];
                var posX = posKey === 'x' ? (head.position[posKey] - cellLength) : node.position.x;
                var posY = posKey === 'y' ? (head.position[posKey] + cellLength) : node.position.y;
                node.setPosition(posX, posY);
                this._cellList.pop();
                this._cellList.unshift(node);

                var index = (headOffset - cellLength) / cellLength * count - 1 - i;
                if (index < 0 || index >= this.data["dataList"].length) {
                    node.active = false;
                    continue;
                }
                node.active = true;
                if (cellControllerName) {
                    var controller = node.getComponent(tableCell);
                    controller.updateCell(this.data, index);
                }
            }
            return true;
        }
    }

    onScroll(sender:object, event:number) {
        switch (event) {
            case 0:
                // cc.log("Scroll to Top");
                break;
            case 1:
                if (this._params["scrollEnd"]) {
                    this._params["scrollEnd"](sender, event);
                }
                // cc.log("Scroll to Bottom");
                break;
            case 2:
                // cc.log("Scroll to Left");
                break;
            case 3:
                // cc.log("Scroll to Right");
                break;
            case 4:
                if (this.scrollView.vertical) {
                    var changed = this._oldPos.y - this.content.position.y;
                } else {
                    changed = this.content.position.x - this._oldPos.x;
                }
                if (Math.round(Math.abs(changed)) >= 1) {
                    this._updateCells(changed);
                    this._oldPos = this.content.position;
                }

                if (this._params["scrolling"]) {
                    this._params["scrolling"](sender, event);
                }
                // cc.log('Scrolling');
                break;
            case 5:
                // cc.log("Bounce Top");
                break;
            case 6:
                // cc.log("Bounce bottom");
                break;
            case 7:
                // cc.log("Bounce left");
                break;
            case 8:
                // cc.log("Bounce right");
                break;
            case 9:
                // cc.log("Auto scroll ended");
                break;
        }
    }

    scrollToOffset(p:cc.Vec2, time:number = 0) {
        this.scrollView.scrollToOffset(p, time);
    }

    /**
     * OnScroll
     */
    public OnScroll(sender: object, event: object) {

    }
}
