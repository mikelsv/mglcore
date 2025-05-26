class mglStatsWindow{
    constructor(name, fontColor, bgColor, updateTime){
        this.name = name;
        this.fontColor = fontColor;
        this.bgColor = bgColor;
        this.updateTime = updateTime;
    }

    initGraph(){
        // Container
        this.dom = document.createElement("div");
        this.dom.style.position = "relative";
        this.dom.style.display = "inline-block";

        // Canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.cssText = `width:${this.WIDTH / this.PR}px;height:${this.HEIGHT / this.PR}px`;
        this.context = this.canvas.getContext("2d");

        // Close button
        this.closeButton = document.createElement("span");
        this.closeButton.innerHTML = "&times;";
        this.closeButton.style.position = "absolute";
        this.closeButton.style.top = "-2px";
        this.closeButton.style.right = "5px";
        this.closeButton.style.cursor = "pointer";
        this.closeButton.style.color = this.fontColor;
        this.closeButton.style.fontSize = "16px";

        this.closeButton.addEventListener("click", () => this.toggleWindow());

        this.isCollapsed = false;

        // Append
        this.dom.appendChild(this.canvas);
        this.dom.appendChild(this.closeButton);
    }

    drawGraph(){
        this.context.font = "bold " + 10 * this.PR + "px monospace";
        this.context.textBaseline = "top";
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        this.context.fillStyle = this.fontColor;
        this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y + 1 * this.PR);
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
        this.context.fillStyle = this.bgColor;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
    }

    toggleWindow(){
        if (this.isCollapsed){
            // Maximize the window
            this.canvas.width = this.WIDTH;
            this.canvas.height = this.HEIGHT;
            this.canvas.style.width = this.WIDTH + "px";
            this.canvas.style.height = this.HEIGHT + "px";
            this.drawGraph(); // Redraw the contents
            this.closeButton.innerHTML = "&times;"; // Cross
            this.isCollapsed = false;
        } else {
            // Minimize the window
            this.dom.width = 20;
            console.log(this.dom);
            this.canvas.width = 17 * this.PR; // Decrease the canvas width
            this.canvas.height = 20 * this.PR; // Decrease the canvas height
            this.canvas.style.width = this.canvas.width + "px"; // Set the style
            this.canvas.style.height = this.canvas.height + "px"; // Set the style
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
            this.context.fillStyle = this.bg; // Set the background color
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // Draw the background
            this.closeButton.innerHTML = "+"; // Change the cross to a plus
            this.isCollapsed = true;
        }
    }
};

// Extended stats
class mglStatsGraph extends mglStatsWindow{
    constructor(name, fontColor, bgColor, updateTime, r){
        super(name, fontColor, bgColor, updateTime);
        this.getAverage = r;
        this.prevTime = null;
        this.sum = 0;
        this.count = 0;

        // Window
        this.PR = Math.round(window.devicePixelRatio || 1);
        this.WIDTH = 90 * this.PR;
        this.HEIGHT = 48 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 2 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = 84 * this.PR;
        this.GRAPH_HEIGHT = 30 * this.PR;

        // Init and draw
        this.initGraph();
        this.drawGraph();
    }

    update(nowTime, value, n, i) {
        if (this.prevTime === null || this.isCollapsed){
            this.prevTime = nowTime;
            return
        }

        this.sum += value;
        this.count ++;

        if(!(nowTime < this.prevTime + this.updateTime)){
            value = this.getAverage ? this.sum / this.count : this.sum;
            this.prevTime += this.updateTime * Math.floor((nowTime - this.prevTime) / this.updateTime);
            this.count = 0;
            this.sum = 0;
            this.context.fillStyle = this.bgColor;
            this.context.globalAlpha = 1;
            this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
            this.context.fillStyle = this.fontColor;
            this.context.fillText(`${value.toFixed(i)} ${this.name}`, this.TEXT_X, this.TEXT_Y + 1 * this.PR);
            this.context.drawImage(this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);
            this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);
            this.context.fillStyle = this.bgColor;
            this.context.globalAlpha = .9;
            this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, Math.round((1 - value / n) * this.GRAPH_HEIGHT));
        }
    }
}

class mglStatsInfo extends mglStatsWindow{
    constructor(name, prop, fontColor, bgColor, updateTime){
        super(name, fontColor, bgColor, updateTime);

        this.properties = prop;
        this.prevTime = null;
        this.sumTriangles = 0;
        this.sumCalls = 0;
        this.count = 0;

        this.PR = Math.round(window.devicePixelRatio || 1);
        this.WIDTH = 126 * this.PR;
        this.HEIGHT = 48 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 2 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = this.WIDTH - 6 * this.PR;
        this.GRAPH_HEIGHT = 30 * this.PR;
        this.PADDING_V = 4.3 * this.PR;
        this.PADDING_H = 1 * this.PR;
        this.TEXT_SPACE = 14 * this.PR;
        this.COLUMN_SPACE = this.GRAPH_WIDTH / 2;

        // Init and draw
        this.initGraph();
        this.drawGraph();
    }

    update(e, [calls, tris, points, lines, geoms, texts, shaders]) {
        if (this.prevTime === null || this.isCollapsed) {
            this.prevTime = e;
            return;
        }

        if(this.sumTriangles += tris, this.sumCalls += calls, this.count++, e < this.prevTime + this.updateTime){
            return;
        }

        calls = Math.round(this.sumCalls / this.count);
        tris = Math.round(this.sumTriangles / this.count);
        this.prevTime += this.updateTime * Math.floor((e - this.prevTime) / this.updateTime);
        this.count = 0;
        this.sumCalls = 0;
        this.sumTriangles = 0;

        const a = [
            `Calls ${this._formatNumber(calls)}`,
            `Tris ${this._formatNumber(tris)}`,
            `Lines ${this._formatNumber(lines)}`,
            `Points ${this._formatNumber(points)}`,
            `Geoms ${this._formatNumber(geoms)}`,
            `Texts ${this._formatNumber(texts)}`,
            `Shaders ${this._formatNumber(shaders)}`
        ];

        // Length
        let len = [20, 20];
        for (let c = 0; c < a.length; c++){
            len[c % 2] += a[c].length * 6;
        }

        this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.WIDTH = Math.max(len[0], len[1]) * this.PR;
        this.GRAPH_WIDTH = this.WIDTH - 6 * this.PR;
        this.COLUMN_SPACE = this.GRAPH_WIDTH / 3;
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.cssText = `width:${this.WIDTH / this.PR}px;height:${this.HEIGHT / this.PR}px`;

        this.context.font = "bold " + 10 * this.PR + "px monospace";
        this.context.textBaseline = "top";
        this.context.fillStyle = this.bgColor;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        this.context.fillStyle = this.fontColor;
        this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y + 1 * this.PR);
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
        this.context.fillStyle = this.bgColor;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
        this.context.fillStyle = this.fontColor;

        const l = Math.ceil(a.length / 3);
        len = [0, 0];
        for (let c = 0; c < a.length; c++) {
            //const h = Math.floor(c / l);
            //const u = c % l;
            const u = (c % 2);
            this.context.fillText(a[c], this.GRAPH_X + this.PADDING_H + len[c % 2], this.GRAPH_Y + this.TEXT_SPACE * u + this.PADDING_V);
            len[c % 2] += a[c].length * 6.5 * this.PR;
        }

        this.context.fillStyle = this.bgColor;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, 0 * this.GRAPH_HEIGHT);
    }

    _formatNumber(e) {
        return e >= 1e9 ? (e / 1e9).toFixed(2) + "ʙ" : e >= 1e6 ? (e / 1e6).toFixed(2) + "ᴍ" : e >= 1e3 ? (e / 1e3).toFixed(2) + "ᴋ" : e.toString()
    }
}

export class mglStats{
    constructor(renderer){
        this.dom = document.createElement("div");
        document.body.appendChild(this.dom);

        this.mode = 0;
        this.queries = [];
        this.beginTime = null;
        this.endTime = null;

        this.clickPanelCallback = n => {
            this.showPanel(++this.mode % this.dom.children.length);
            n.preventDefault();
        };

        // Panels
        this.renderer = renderer;
        this.fpsPanel = this.addPanel(new mglStatsGraph("FPS", "#0ff", "#002", 1e3, !1));
        this.cpuPanel = this.addPanel(new mglStatsGraph("ms CPU", "#0f0", "#020", 100, !0));

        if(self.performance && self.performance.memory)
		    this.memPanel = this.addPanel(new mglStatsGraph('MB', '#f08', '#201', 1000));

        if(renderer){
            this.gl = renderer.getContext('webgl2');
            this.ext = this.gl ? this.gl.getExtension("EXT_disjoint_timer_query") : null;

            if(this.ext)
                this.gpuPanel = this.addPanel(new mglStatsGraph("ms GPU", "#ff0", "#220", 100, !0));
        }

        this.infoPanel = this.addPanel(new mglStatsInfo("INFO", ["Calls", "Triangles"], "#fff", "#022", 100));

        this.dom.addEventListener("contextmenu", event => {
            this.switchMinimal(!this._minimal);
            event.preventDefault();
        }, !1);

        this.switchMinimal(0);
        this.switchOrientation(0);
    }

    get minimal(){
        return this._minimal;
    }

    set minimal(e){
        this.switchMinimal(e);
    }

    switchMinimal(e){
        if(this._minimal = e, !e){
            this.dom.removeEventListener("click", this.clickPanelCallback);
            this.showAllPanels();

            return;
        }
        this.dom.addEventListener("click", this.clickPanelCallback, false);
        this.showPanel(0);
    }

    switchOrientation(value = 0){
        if(!value)
            this.dom.style.cssText = "position:fixed; top:0; left:0; opacity:0.8; z-index:10000; display:flex;";
        else
            this.dom.style.cssText = "position:fixed; top:0; left:0; opacity:0.8; z-index:10000; cursor:pointer;";
    }

    addPanel(e){
        return this.dom.appendChild(e.dom), e;
    }

    showPanel(id){
        this.mode = id;
        for(let t = 0; t < this.dom.children.length; t++)
            this.dom.children[t].style.display = t === id ? "block" : "none"
    }

    showAllPanels(){
        for(const e of this.dom.children)
            e.style.display = "block";
    }

    hideAllPanels(){
        for(const e of this.dom.children)
            e.style.display = "none";
    }

    // Animate
    beginAnimate(){
        this.begin();
        this.beginQuery();
    }

    endAnimate(){
        this.end();
        this.endQuery();
        this.update();
    }

    // Perfomance
    begin(){
        this.beginTime = performance.now();
    }

    end(){
        this.endTime = performance.now();
    }

    // GPU
    beginQuery(){
        this.gpuPanel && (this.query = this.gl.createQuery(), this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.query));
    }

    endQuery(){
        this.gpuPanel && (this.gl.endQuery(this.ext.TIME_ELAPSED_EXT), this.queries.push(this.query), this.query = null);
    }

    // Quires
    getQueriesTime(){
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
        return n;
    }

    // Update
    update(){
        this.cpuPanel.update(this.endTime,  this.endTime - this.beginTime, 33, 3);
        this.fpsPanel.update(this.endTime, 1, 144, 0);

        if(this.memPanel){
            var memory = performance.memory;
            this.memPanel.update(this.endTime, memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576, 0);
        }

        if(this.gpuPanel)
            this.gpuPanel.update(this.endTime, this.getQueriesTime(), 33, 3);

        if(this.infoPanel)
            this.infoPanel.update(this.endTime, [
                this.renderer.info.render.calls,
                this.renderer.info.render.triangles,
                this.renderer.info.render.points,
                this.renderer.info.render.lines,
                this.renderer.info.memory.geometries,
                this.renderer.info.memory.textures,
                this.renderer.info.programs.length
            ]);

    }
}
