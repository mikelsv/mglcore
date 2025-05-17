// MSV Core Library functions for JavaScript. 2025.

// Vector2
class KiVec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Method for calculating the length of a vector
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    // Method for vector normalization
    normalize() {
        const len = this.length();
        if (len === 0) return new KiVec2(0, 0); // Возвращаем нулевой вектор, если длина равна 0
        return new KiVec2(this.x / len, this.y / len);
    }

    // Method for adding two vectors
    add(vector) {
        return new KiVec2(this.x + vector.x, this.y + vector.y);
    }

    // Method for subtracting two vectors
    subtract(vector) {
        return new KiVec2(this.x - vector.x, this.y - vector.y);
    }

    // Method for multiplying a vector by a scalar
    multiply(scalar) {
        return new KiVec2(this.x * scalar, this.y * scalar);
    }

    // Method of truncating values ​​to specified boundaries
    crop(min, max){
        this.x = Math.max(min, Math.min(max, this.x));
        this.y = Math.max(min, Math.min(max, this.y));
    }

    empty(){
        return this.x == 0 && this.y == 0;
    }

    // Method to reset values ​​to zero
    reset(){
        this.x = 0;
        this.y = 0;
    }

    // Method to display a vector as a string
    toString() {
        return `KiVec2(${this.x}, ${this.y})`;
    }
}

// Based on https://easings.net/
// Value from 0 to 1
class mglEasting{
    easeInSine(x){
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    easeInOutQuad(x){
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }
};


class mglTweak{
    startTime = 0;
    endTime = 0;

    start(duration){
        this.startTime = Date.now();
        this.endTime = this.startTime + duration;
    }

    active(){
        return this.startTime != this.endTime;
    }

    value(){
        let time = Date.now();
        let delta = this.endTime - this.startTime;

        if(time > this.endTime)
            return 1;

        return (time - this.startTime) / (this.endTime - this.startTime);
    }

    is(time){
        return this.startTime <= time && time < this.endTime;
    }

    mix(from, to, val){
        // Make sure val is between 0 and 1
        val = Math.max(0, Math.min(1, val));

        // Return the mixed value
        return from + (to - from) * val;
    }

    end(){
        return this.endTime < Date.now();
    }

    stop(){
        this.endTime = this.startTime;
    }
};

class mglHtmlPage{
    constructor(){}

    setTitle(title, description){
        this.title = title;
        this.description = description;
        this.isCollapsed = false;

        this.createHtmlStructure();
        this.addStyles();
        this.addEventListeners();
    }

    createHtmlStructure() {
        // Создаем overlay (фон)
        this.overlay = document.createElement('div');
        this.overlay.className = 'mgl-html-page-overlay';

        // Создаем основное окно
        this.container = document.createElement('div');
        this.container.className = 'mgl-html-page-container';

        // Создаем заголовок
        this.header = document.createElement('div');
        this.header.className = 'mgl-html-page-header';
        this.header.textContent = this.title;

        // Создаем описание
        this.content = document.createElement('div');
        this.content.className = 'mgl-html-page-content';
        this.content.innerHTML = this.description;

        // Собираем структуру
        this.container.appendChild(this.header);
        this.container.appendChild(this.content);
        this.overlay.appendChild(this.container);

        // Добавляем в конец body
        document.body.appendChild(this.overlay);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
      .mgl-html-page-overlay {
        position: fixed;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 0;
        #background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: start;
        z-index: 9999;
      }

      .mgl-html-page-container {
        font-family: Arial, sans-serif;
        border: 1px solid #ddd;
        border-radius: 8px;
        width: 80%;
        max-width: 600px;
        background-color: white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .mgl-html-page-header {
        background-color: #f5f5f5;
        padding: 15px 20px;
        cursor: pointer;
        font-weight: bold;
        font-size: 18px;
        border-bottom: 1px solid #ddd;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .mgl-html-page-header:hover {
        background-color: #e9e9e9;
      }

      .mgl-html-page-content {
        padding: 20px;
        background-color: white;
      }

      .mgl-html-page-container.collapsed {
        transform: translateY(-50px);
      }

      .mgl-html-page-container.collapsed .mgl-html-page-content {
        display: none;
      }

      .mgl-html-page-close {
        font-size: 24px;
        color: #888;
        cursor: pointer;
      }

      .mgl-html-page-close:hover {
        color: #333;
      }
    `;

        document.head.appendChild(style);
    }

  addEventListeners() {
    // Сворачивание/разворачивание по клику на заголовок
    this.header.addEventListener('click', (e) => {
      if (e.target.classList.contains('mgl-html-page-close')) return;

      this.isCollapsed = !this.isCollapsed;
      this.toggleCollapse();
    });

    // Закрытие по клику на overlay (вне окна)
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  toggleCollapse() {
    if (this.isCollapsed) {
      this.container.classList.add('collapsed');
    } else {
      this.container.classList.remove('collapsed');
    }
  }

  close() {
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.remove();
    }, 300);
  }
}

class mglConsole {
    constructor(options = {}) {
        this.options = {
            maxLines: 10,
            title: 'Console>_',
            collapsed: true,
            init: true,
            ...options
        };

        this.lines = [];
        this.container = null;
        this.header = null;
        this.content = null;
        this.isInitialized = false;
        this.isCollapsed = options.collapsed;

        if(options.init)
            this.init();
    }

    init(){
        if(this.isInitialized)
            return;

        this.isInitialized = true;

        // Create a container
        this.container = document.createElement('div');
        this.container.className = 'mglConsoleContainer';

        // Create a title
        this.header = document.createElement('div');
        this.header.className = 'mglConsoleHeader';
        this.header.textContent = this.options.title;

        // Create a content area
        this.content = document.createElement('div');
        this.content.className = 'mglConsoleContent';

        // Add elements to the container
        this.container.appendChild(this.header);
        this.container.appendChild(this.content);

        // Add the container to the body
        document.body.appendChild(this.container);

        // Apply styles
        this.applyStyles();

        // Add event handlers
        this.header.addEventListener('click', () => this.toggle());

        // Set the initial state
        this.collapse(this.options.collapsed);
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mglConsoleContainer {
                position: fixed;
                bottom: 10px;
                left: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                font-family: monospace;
                font-size: 14px;
                border-radius: 5px;
                overflow: hidden;
                z-index: 10000;
                transition: width 0.3s ease, max-height 0.3s ease;
            }

            .mglConsoleHeader {
                padding: 8px 12px;
                background-color: rgba(0, 0, 0, 0.8);
                cursor: pointer;
                user-select: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .mglConsoleHeader:hover {
                background-color: rgba(50, 50, 50, 0.8);
            }

            .mglConsoleContent {
                max-height: 300px;
                overflow-y: auto;
                padding: 5px;
                transition: max-height 0.3s ease;
            }

            .mglConsoleContent.collapsed {
                width: 100px;
                max-height: 0;
                padding: 0;
            }

            .mglConsoleLine {
                word-break: break-word;
                border-color: #d6d8db;
                margin-bottom: .1rem;
                padding: .2rem 1.00rem;
                border: 1px solid #b8bfb7ba;
                border-radius: .25rem;
            }
        `;
        document.head.appendChild(style);
    }

    log(...args){
        this.pushLog('log', ...args);

        console.log(...args);
    }

    warn(...args){
        this.pushLog('warning', ...args);

        console.warn(...args);
    }

    error(...args){
        this.pushLog('error', ...args);

        console.error(...args);
    }

    pushLog(type, ...args){
        if (!this.isInitialized)
            return ;

        // Format arguments as console.log
        const line = args.map(arg => {
            if (typeof arg === 'object'){
                try {
                    return JSON.stringify(arg, null, 2);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        // Add a new line
        this.lines.push(line);

        // Limit the number of lines
        if (this.lines.length > this.options.maxLines){
            this.lines.shift();
        }

        // Adding a new element
        const logEntry = document.createElement('div');
        logEntry.className = 'mglConsoleLine';
        logEntry.textContent = line;
        this.content.appendChild(logEntry);

        // Delete old lines if the maximum number is exceeded
        if (this.content.children.length > this.options.maxLines){
            this.content.removeChild(this.content.children[0]);
        }

        // Scroll down to show the latest log
        if(!this.isCollapsed)
            this.content.scrollTop = this.content.scrollHeight;
    }

    updateContent_DELETE(){
        if (!this.isInitialized) return;

        this.content.innerHTML = '';

        this.lines.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.className = 'mglConsoleLine';
            lineElement.textContent = line;
            this.content.appendChild(lineElement);
        });

        this.content.scrollTop = this.content.scrollHeight;
    }

    toggle(){
        this.collapse(!this.isCollapsed);
        //this.collapse(!this.content.classList.contains('collapsed'));
    }

    collapse(value = 1){
        if(!this.isInitialized)
            return;

        this.isCollapsed = value;

        if(value)
            this.content.classList.add('collapsed');
        else
            this.content.classList.remove('collapsed');
    }

    clear(){
        this.lines = [];
        this.updateContent();
    }
};

// DEPRECATED AND DELETE
class mglConsole2{
    constructor(init = false) {
        this.maxLines = 10;
        this.isVisible = true;
        this.isCollapse = false;
        this.logContainer = null;
        this.header = null;

        if(init)
            this.init();
    }

    init(){
        // Make
        const style = document.createElement('style');
        style.textContent = `
            #mglConsole {
                position: fixed;
                bottom: 0;
                left: 0;
                max-height: 200px;
                overflow-y: auto;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 3px;
                border-radius: .25rem;
                font-family: monospace;
                transition: height 0.3s;
            }
            #mglConsoleHeader {
                cursor: pointer;
                background-color: rgba(255, 255, 255, 0.2);
                padding: 5px;
                margin-bottom: .2rem;
                text-align: left;
            }
            .mglConsoleLine {
                border-color: #d6d8db;
                margin-bottom: .2rem;
                padding: .2rem 1.00rem;
                border: 1px solid #b8bfb7ba;
                border-radius: .25rem;
            }
        `;
        document.head.appendChild(style);

        // Создание контейнера для логов
        this.logContainer = document.createElement('div');
        this.logContainer.id = 'mglConsole';

        // Создание заголовка
        this.header = document.createElement('div');
        this.header.id = 'mglConsoleHeader';
        this.header.textContent = 'Console>_';
        this.header.onclick = () => this.toggleCollapse();

        this.logContainer.appendChild(this.header);
        document.body.appendChild(this.logContainer);

        this.setCollapse(1);
    }

    log(...messages){
        console.log(...messages);

        if(!this.logContainer)
            return;

        const logEntry = document.createElement('div');
        logEntry.className = 'mglConsoleLine';

        logEntry.textContent = messages.join(' ');
        this.logContainer.appendChild(logEntry);

        // Delete old lines if the maximum number is exceeded
        if (this.logContainer.children.length > this.maxLines + 1) {
            this.logContainer.removeChild(this.logContainer.children[1]);
        }

        // Scroll down to show the latest log
        if(this.isVisible)
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    setCollapse(value){
        this.isCollapse = value;
        this.logContainer.style.height = this.isCollapse ? '0' : 'auto';
        this.header.style.paddingTop = this.isCollapse ? '20px' : '0';


       // this.logContainer.style.bottom = this.isCollapse ? '10px' : '20px';
    }

    toggleCollapse(){
        this.setCollapse(!this.isCollapse);
    }

    setVisible(value){
        this.logContainer.style.visibility = value ? 'visible' : 'hidden';
    }
};