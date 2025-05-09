// Extended stats
class mglStatsCpu {
    constructor(e, t, n, i, r) {
        this.name = e;
        this.fg = t;
        this.bg = n;
        this.updateTime = i;
        this.getAverage = r;
        this.prevTime = null;
        this.sum = 0;
        this.count = 0;
        this.PR = Math.round(window.devicePixelRatio || 1);
        this.WIDTH = 90 * this.PR;
        this.HEIGHT = 48 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 2 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = 84 * this.PR;
        this.GRAPH_HEIGHT = 30 * this.PR;
        this.dom = document.createElement("canvas");
        this.dom.width = this.WIDTH;
        this.dom.height = this.HEIGHT;
        this.dom.style.cssText = "width:90px;height:48px";
        this.context = this.dom.getContext("2d");
        this.context.font = "bold " + 10 * this.PR + "px monospace";
        this.context.textBaseline = "top";
        this.context.fillStyle = n;
        this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        this.context.fillStyle = t;
        this.context.fillText(e, this.TEXT_X, this.TEXT_Y + 1 * this.PR);
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
        this.context.fillStyle = n;
        this.context.globalAlpha = .9;
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
    }

    update(e, t, n, i) {
        if (this.prevTime === null) {
            this.prevTime = e;
            return
        }

        this.sum += t;
        this.count ++;

        if(!(e < this.prevTime + this.updateTime)){
            t = this.getAverage ? this.sum / this.count : this.sum;
            this.prevTime += this.updateTime * Math.floor((e - this.prevTime) / this.updateTime);
            this.count = 0;
            this.sum = 0;
            this.context.fillStyle = this.bg;
            this.context.globalAlpha = 1;
            this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
            this.context.fillStyle = this.fg;
            this.context.fillText(`${t.toFixed(i)} ${this.name}`, this.TEXT_X, this.TEXT_Y + 1 * this.PR);
            this.context.drawImage(this.dom, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);
            this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);
            this.context.fillStyle = this.bg;
            this.context.globalAlpha = .9;
            this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, Math.round((1 - t / n) * this.GRAPH_HEIGHT));
        }
    }
}

class mglStatsInfo {
    constructor(e, t, n, i, r) {
        this.name = e, this.properties = t, this.fg = n, this.bg = i, this.updateTime = r, this.prevTime = null, this.sumTriangles = 0, this.sumCalls = 0, this.count = 0, this.PR = Math.round(window.devicePixelRatio || 1), this.WIDTH = 126 * this.PR, this.HEIGHT = 48 * this.PR, this.TEXT_X = 3 * this.PR, this.TEXT_Y = 2 * this.PR, this.GRAPH_X = 3 * this.PR, this.GRAPH_Y = 15 * this.PR, this.GRAPH_WIDTH = this.WIDTH - 6 * this.PR, this.GRAPH_HEIGHT = 30 * this.PR, this.PADDING_V = 4.3 * this.PR, this.PADDING_H = 1 * this.PR, this.TEXT_SPACE = 14 * this.PR, this.COLUMN_SPACE = this.GRAPH_WIDTH / 2, this.dom = document.createElement("canvas"), this.dom.width = this.WIDTH, this.dom.height = this.HEIGHT, this.dom.style.cssText = `width:${this.WIDTH/this.PR}px;height:${this.HEIGHT/this.PR}px`, this.context = this.dom.getContext("2d"), this.context.font = "bold " + 10 * this.PR + "px monospace", this.context.textBaseline = "top", this.context.fillStyle = i, this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT), this.context.fillStyle = n, this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y + 1 * this.PR), this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT), this.context.fillStyle = i, this.context.globalAlpha = .9, this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT)
    }
    update(e, [t, n, i, r]) {
        if (this.prevTime === null) {
            this.prevTime = e;
            return
        }
        if (this.sumTriangles += n, this.sumCalls += t, this.count++, e < this.prevTime + this.updateTime) return;
        t = Math.round(this.sumCalls / this.count), n = Math.round(this.sumTriangles / this.count), this.prevTime += this.updateTime * Math.floor((e - this.prevTime) / this.updateTime), this.count = 0, this.sumCalls = 0, this.sumTriangles = 0;
        const a = [`Calls ${this._formatNumber(t)}`, `Tris ${this._formatNumber(n)}`, `Lines ${this._formatNumber(r)}`, `Points ${this._formatNumber(i)}`];
        let o = 0;
        for (let c = 0; c < a.length / 2; c++) o = Math.max((a[c].length + a[c + 2].length) * 8, o);
        this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT), this.WIDTH = o * this.PR, this.GRAPH_WIDTH = this.WIDTH - 6 * this.PR, this.COLUMN_SPACE = this.GRAPH_WIDTH / 2, this.dom.width = this.WIDTH, this.dom.height = this.HEIGHT, this.dom.style.cssText = `width:${this.WIDTH/this.PR}px;height:${this.HEIGHT/this.PR}px`, this.context.font = "bold " + 10 * this.PR + "px monospace", this.context.textBaseline = "top", this.context.fillStyle = this.bg, this.context.globalAlpha = 1, this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT), this.context.fillStyle = this.fg, this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y + 1 * this.PR), this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT), this.context.fillStyle = this.bg, this.context.globalAlpha = .9, this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT), this.context.fillStyle = this.fg;
        const l = Math.ceil(a.length / 2);
        for (let c = 0; c < a.length; c++) {
            const h = Math.floor(c / l),
                u = c % l;
            this.context.fillText(a[c], this.GRAPH_X + this.PADDING_H + this.COLUMN_SPACE * h, this.GRAPH_Y + this.TEXT_SPACE * u + this.PADDING_V)
        }
        this.context.fillStyle = this.bg, this.context.globalAlpha = .9, this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, 0 * this.GRAPH_HEIGHT)
    }
    _formatNumber(e) {
        return e >= 1e9 ? (e / 1e9).toFixed(2) + "ʙ" : e >= 1e6 ? (e / 1e6).toFixed(2) + "ᴍ" : e >= 1e3 ? (e / 1e3).toFixed(2) + "ᴋ" : e.toString()
    }
}

export class mglStats {
    constructor(e) {
        var t;
        this.dom = document.createElement("div");
        document.body.appendChild(this.dom);

        this.mode = 0;
        this.queries = [];
        this.beginTime = null;
        this.endTime = null;

        this.clickPanelCallback = n => {
            n.preventDefault(), this.showPanel(++this.mode % this.dom.children.length)
        };

        this.renderer = e;
        this.fpsPanel = this.addPanel(new mglStatsCpu("FPS", "#0ff", "#002", 1e3, !1));
        this.cpuPanel = this.addPanel(new mglStatsCpu("ms CPU", "#0f0", "#020", 100, !0));

        if(e){
            this.gl = e.getContext('webgl2');
            this.ext = this.gl ? this.gl.getExtension("EXT_disjoint_timer_query") : null;
            this.ext && (this.gpuPanel = this.addPanel(new mglStatsCpu("ms GPU", "#ff0", "#220", 100, !0)))
        }

        this.infoPanel = this.addPanel(new mglStatsInfo("INFO", ["Calls", "Triangles"], "#fff", "#022", 100));

        this.dom.addEventListener("contextmenu", n => {
            n.preventDefault(), this.switchMinimal(!this._minimal)
        }, !1);

        //console.log("GPU", this.gl, this.ext, this.gpuPanel);
        //console.log(this.gl.getSupportedExtensions());

        this.switchMinimal(!1);
    }
    get minimal() {
        return this._minimal
    }
    set minimal(e) {
        this.switchMinimal(e)
    }
    switchMinimal(e) {
        if (this._minimal = e, !e) {
            this.dom.removeEventListener("click", this.clickPanelCallback);
            this.showAllPanels();
            this.dom.style.cssText = "position:fixed; top:0; left:0; opacity:0.8; z-index:10000; display:flex;";
            return
        }
        this.dom.addEventListener("click", this.clickPanelCallback, !1);
        this.dom.style.cssText = "position:fixed; top:0; left:0; opacity:0.8; z-index:10000; cursor:pointer;";
        this.showPanel(0);
    }
    addPanel(e) {
        return this.dom.appendChild(e.dom), e
    }
    showPanel(e) {
        this.mode = e;
        for (let t = 0; t < this.dom.children.length; t++) this.dom.children[t].style.display = t === e ? "block" : "none"
    }
    showAllPanels() {
        for (const e of this.dom.children) e.style.display = "block"
    }
    hideAllPanels(){
        for (const e of this.dom.children) e.style.display = "none"
    }
    begin() {
        this.beginTime = performance.now()
    }
    beginQuery() {
        this.gpuPanel && (this.query = this.gl.createQuery(), this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.query))
    }
    end() {
        this.endTime = performance.now()
    }
    endQuery() {
        this.gpuPanel && (this.gl.endQuery(this.ext.TIME_ELAPSED_EXT), this.queries.push(this.query), this.query = null)
    }
    getQueriesTime() {
        const e = this.gl,
            t = this.ext;
        let n = 0;
        for (let i = this.queries.length - 1; i >= 0; i--) {
            const r = this.queries[i],
                a = e.getQueryParameter(r, e.QUERY_RESULT_AVAILABLE),
                o = e.getParameter(t.GPU_DISJOINT_EXT);
            if (a && !o) {
                const l = e.getQueryParameter(r, e.QUERY_RESULT) * 1e-6;
                n += l, e.deleteQuery(r), this.queries.splice(i, 1)
            }
        }
        return n
    }
    update() {
        var e, t;
        const n = this.endTime;
        this.cpuPanel.update(n, n - this.beginTime, 33, 2);
        this.fpsPanel.update(n, 1, 144, 0);

        (e = this.gpuPanel) == null || e.update(n, this.getQueriesTime(), 33, 2);
        (t = this.infoPanel) == null || t.update(n, [this.renderer.info.render.calls, this.renderer.info.render.triangles, this.renderer.info.render.points, this.renderer.info.render.lines])
    }
}
