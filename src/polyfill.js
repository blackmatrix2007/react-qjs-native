/* global globalThis */
// import * as std from 'std'
// import * as os from 'os'

import uuid from 'tiny-uuid'

globalThis.process = { env: { NODE_ENV: 'development' } }
if (!globalThis.setTimeout) globalThis.setTimeout = globalThis.os ? globalThis.os.setTimeout : 
    (f, d) => { f(); }
if (!globalThis.console) globalThis.console = {}

try {
    globalThis.console.log = app.log
    globalThis.console.warn = app.log
    globalThis.console.error = app.log
    globalThis.sendMessage = (type, msg) => app.log(msg)

} catch (err) {
    globalThis.console.log = (msg) => sendMessage('log', JSON.stringify(msg))
    globalThis.console.warn = (msg) => sendMessage('log', JSON.stringify(msg))
    globalThis.console.error = (msg) => sendMessage('log', JSON.stringify(msg))
}

const _getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (key === 'children') {
      return value.map(c => c._id);
    }
    return value;
  };
};

class Elm {
    constructor(t) {
        this._id = uuid();
        this.type = t;
        this.children = [];
        this.attributes = {};
        this.style = {};
        // console.log(JSON.stringify(this));
    }

    appendChild(c) {
        c._parent = this._id;
        this.children.push(c);
        // console.log(JSON.stringify(c));

        sendMessage('onAppend', JSON.stringify({ element: this._id, child: c._id }));
    }

    removeChild(c) {
        let idx = this.children.indexOf(c);
        if (idx != -1) {
            this.children.splice(idx, 1);
        }

        sendMessage('onRemove', JSON.stringify({ element: this._id, child: c._id }));
    }

    insertBefore(c, b) {
        let idx = this.children.indexOf(b);
        if (idx != -1) {
            this.children.splice(idx, 0, c);
        }
    }

    setAttribute(a, v) {
        this.attributes[a] = v;
        sendMessage('onUpdate', JSON.stringify({ element: this._id, attributes: { [a] : v } }));
    }

    removeAttribute(a) {
        erase(this.attributes[a]);
        // sendMessage('onUpdate', JSON.stringify({ element: this._id }));
    }
}

class Doc extends Elm {
    constructor() {
        super('document');
    }

    createElement(t) {
        let res = new Elm(t);
        sendMessage('onCreate', JSON.stringify(res, _getCircularReplacer()));
        return res;
    }

    createTextNode(t) {
        let res = new Elm('text');
        res.attributes['textContent'] = t;
        sendMessage('onCreate', JSON.stringify(res, _getCircularReplacer()))
        return res;
    }

    getElementById() {
        return globalThis.document;
    }
}

globalThis.document = new Doc;
sendMessage('onCreate', JSON.stringify(globalThis.document, _getCircularReplacer()))