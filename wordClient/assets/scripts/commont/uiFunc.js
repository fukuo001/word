(function () {
    window.client = window.client || {};
    client.uiFuncs = {
        /**
         * @param params = {
         *      container: cc.Node,                     // 以容器大小扩张
         *      cellPrefab: cc.Prefab,
         *      cellController: controllerScript,       // 与cellPrefab绑定的脚本组件名
         *      alignment: 'vertical' or 'horizontal',  // 默认为vertical(垂直)
         *      scrollEnd: Function,
         *      scrolling: Function,
         * }
         * @param data = {dataList: []} or []
         * 
         * @return {cc.Component} script tableview
         */
        tableViewPrefab:null,
        loadTableView:function () {
            var tableName = 'tableView2';
            var that = this;
            cc.loader.loadRes('prefabs/common/' + tableName, function (err, prefab) {
                !err && (that.tableViewPrefab = prefab);
            });
        },
        tableview: (function () {
            var tableViewPrefab = null;
            var tableName = 'tableView2';
            cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
                cc.loader.loadRes('prefabs/common/' + tableName, function (err, prefab) {
                    !err && (tableViewPrefab = prefab);
                });
            });
            return function (params, data) {
                // cc.assert(!!tableViewPrefab, 'tableview prefab was not found, please check out');

                var container = params.container;
                var node = cc.instantiate(this.tableViewPrefab);
                container.addChild(node);
                this.updateAlignment(node);
                var tableview = node.getComponent(tableName);
                tableview.init(params, data);
                return tableview;
            }
        }()),

        updateAlignment: function (node) {
            var widget = node.getComponent(cc.Widget);
            var layout = node.getComponent(cc.Layout);
            if (widget) {
                widget.updateAlignment();
            }
            if (layout) {
                layout.updateLayout();
            }
            var children = node.getChildren();
            for (var i = 0, len = children.length; i < len; ++i) {
                this.updateAlignment(children[i]);
            }
        },
        // 获取参数
        getRequest: function () {//这个函数，其实就是js的方法，在我的博客中能找到出处的
            var url = location.search; //获取url中"?"符后的字串
            var theRequest = new Object();
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                var strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        /**
         * 更新图片
         * @param {*} _sprite 
         * @param {*} _url 
         */
        setSpriteFrame: function (_sprite, _url) {
            cc.loader.loadRes(_url, cc.SpriteFrame, (err, spriteFrame) => {
                if (err || cc.isValid(_sprite.node) == false) {
                    cc.log("ok in setSpriteFrame err " + (err || "node is "))
                    return;
                }
                _sprite.spriteFrame = spriteFrame;
            })
        },

        /**
         * 更新图片
         * @param {*} _sprite 
         * @param {*} _url 
         */
        setLoadSpriteFrame: function (_sprite, _url) {
            cc.loader.load({ url: _url, type: 'png' }, (err, texture) => {
                if (cc.isValid(_sprite) === false) { return }
                if (err) {
                    cc.log('OK IN _downloadHead ' + err);
                    return;
                }

                var spriteFrame = new cc.SpriteFrame(texture);
                if (spriteFrame) {
                    _sprite.spriteFrame = spriteFrame;
                }
            });
        },

        /**
         * 显示新手
         * @param {*} _node 
         */
        guide: function (_node) {
            var node = { x: 0, y: 0, w: 0, h: 0 };
            var wordP = _node.getNodeToWorldTransform();
            var winSize = cc.director.getWinSize();
            node.x = wordP.tx - winSize.width / 2 + _node.width / 2;
            node.y = wordP.ty - winSize.height / 2 + _node.height / 2;
            node.w = _node.width;
            node.h = _node.height;

            notification.trigger(notificationType.showGuide, { node: node });

            cc.log('OK IN guide ' + node.x, node.y);
        },

        showTip: function (_txt, _time = 2) {
            client.WindowFactory.popWindow('commonTip', { txt: _txt, time: _time })
        },

        openCommonWnd: function (data) {
            if(data.buttons.length == 1){
                client.WindowFactory.popWindow('commonWnd', data);
            }else{
                client.WindowFactory.popWindow('commonWnd2', data);
            }
            
        },

        // 获取时间戳
        getTime: function () {
            return Date.parse(new Date()) / 1000;
            // (new Date()).valueOf();
            // var date = new Date();
            // var sign1 = "-";
            // var sign2 = ":";
            // var year = date.getFullYear() // 年
            // var month = date.getMonth() + 1; // 月
            // var day = date.getDate(); // 日
            // var hour = date.getHours(); // 时
            // var minutes = date.getMinutes(); // 分
            // var seconds = date.getSeconds() //秒

            // // 给一位数数据前面加 “0”
            // if (month >= 1 && month <= 9) {
            //     month = "0" + month;
            // }
            // if (day >= 0 && day <= 9) {
            //     day = "0" + day;
            // }
            // if (hour >= 0 && hour <= 9) {
            //     hour = "0" + hour;
            // }
            // if (minutes >= 0 && minutes <= 9) {
            //     minutes = "0" + minutes;
            // }
            // if (seconds >= 0 && seconds <= 9) {
            //     seconds = "0" + seconds;
            // }
            // var currentdate = year + sign1 + month + sign1 + day + " " + hour + sign2 + minutes + sign2 + seconds;
            return currentdate;
        },

        // 随机数
        random: function (n, count) {
            return n + Math.floor(Math.random() * (count - n));
        },

        //********************************************************************************************** */
        // sha 加密 开始
        //********************************************************************************************** */
        hex_sha1: function (s) {
            return this.binb2hex(this.core_sha1(this.str2binb(s), s.length * this.chrsz));
        },

        /**
         * _obj 需要存储控件名的对象
         * _node 需要绑定的node
         */
        bindControl: function (_obj, _node) {
            for (let index = 0; index < _node.children.length; index++) {
                if (_node.children[index].children.length > 0) {
                    this.bindControl(_obj, _node.children[index]);
                }
                if (_node.children[index]._name.indexOf("_Node") !== -1) {
                    _obj[_node.children[index]._name] = _node.children[index];
                } else if (_node.children[index]._name.indexOf("_Label") !== -1) {
                    _obj[_node.children[index]._name] = _node.children[index].getComponent(cc.Label);
                } else if (_node.children[index]._name.indexOf("_Sprite") !== -1) {
                    _obj[_node.children[index]._name] = _node.children[index].getComponent(cc.Sprite);
                } else if (_node.children[index]._name.indexOf("_Toggle") !== -1) {
                    _obj[_node.children[index]._name] = _node.children[index].getComponent(cc.Toggle);
                }
            }
        },

        /**
         * 通用刷新
         * @param {*} _obj 控件对象
         * @param {*} _data 数据
         */
        generalUpdateView: function (_obj, _data) {
            for (const name in _data) {
                var keys = name.split('_');
                if (_obj[keys[0] + '_' + keys[1]] !== undefined) {
                    // cc.log("OK in ", keys[0], keys[1], keys[2]);
                    keys.length >= 3 && (_obj[keys[0] + '_' + keys[1]][keys[2]] = _data[name]);
                } else {
                    cc.log('OK IN generalUpdateView key', (keys[0] + '_' + keys[1]))
                }


            }
        },
        hexcase: 0,
        chrsz: 8,
        binb2hex: function (binarray) {
            var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
            }
            return str;
        },

        core_sha1: function (x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;
            var w = Array(80);
            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;
            var e = -1009589776;
            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;
                for (var j = 0; j < 80; j++) {
                    if (j < 16) w[j] = x[i + j];
                    else w[j] = this.rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    var t = this.safe_add(this.safe_add(this.rol(a, 5), this.sha1_ft(j, b, c, d)), this.safe_add(this.safe_add(e, w[j]), this.sha1_kt(j)));
                    e = d;
                    d = c;
                    c = this.rol(b, 30);
                    b = a;
                    a = t;
                }
                a = this.safe_add(a, olda);
                b = this.safe_add(b, oldb);
                c = this.safe_add(c, oldc);
                d = this.safe_add(d, oldd);
                e = this.safe_add(e, olde);
            }
            return Array(a, b, c, d, e);
        },

        str2binb: function (str) {
            var bin = Array();
            var mask = (1 << this.chrsz) - 1;
            for (var i = 0; i < str.length * this.chrsz; i += this.chrsz)
                bin[i >> 5] |= (str.charCodeAt(i / this.chrsz) & mask) << (24 - i % 32);
            return bin;
        },
        safe_add: function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        },

        rol: function (num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        },

        sha1_ft: function (t, b, c, d) {
            if (t < 20) return (b & c) | ((~b) & d);
            if (t < 40) return b ^ c ^ d;
            if (t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        },

        sha1_kt: function (t) {
            return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
        },


        encodeUTF8: function (s) {
            var i, r = [], c, x;
            for (i = 0; i < s.length; i++)
                if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
                else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
                else {
                    if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
                        c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
                            r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
                    else r.push(0xE0 + (c >> 12 & 0xF));
                    r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
                };
            return r;
        },

        // 字符串加密成 hex 字符串
        sha1: function (s) {
            var data = new Uint8Array(this.encodeUTF8(s))
            var i, j, t;
            var l = ((data.length + 8) >>> 6 << 4) + 16, s = new Uint8Array(l << 2);
            s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
            for (t = new DataView(s.buffer), i = 0; i < l; i++)s[i] = t.getUint32(i << 2);
            s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
            s[l - 1] = data.length << 3;
            var w = [], f = [
                function () { return m[1] & m[2] | ~m[1] & m[3]; },
                function () { return m[1] ^ m[2] ^ m[3]; },
                function () { return m[1] & m[2] | m[1] & m[3] | m[2] & m[3]; },
                function () { return m[1] ^ m[2] ^ m[3]; }
            ], rol = function (n, c) { return n << c | n >>> (32 - c); },
                k = [1518500249, 1859775393, -1894007588, -899497514],
                m = [1732584193, -271733879, null, null, -1009589776];
            m[2] = ~m[0], m[3] = ~m[1];
            for (i = 0; i < s.length; i += 16) {
                var o = m.slice(0);
                for (j = 0; j < 80; j++)
                    w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
                        t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
                        m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
                for (j = 0; j < 5; j++)m[j] = m[j] + o[j] | 0;
            };
            t = new DataView(new Uint32Array(m).buffer);
            for (var i = 0; i < 5; i++)m[i] = t.getUint32(i << 2);

            var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
                return (e < 16 ? "0" : "") + e.toString(16);
            }).join("");
            return hex;
        }

        //********************************************************************************************** */
        // sha 加密 结束
        //********************************************************************************************** */
    }
})();