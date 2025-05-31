document.addEventListener("DOMContentLoaded", function(){
     const pathName = window.location.pathname;
     const pathDocs = pathName.substring( 0, pathName.indexOf( 'docs' ) + 4 );

    // Syntax highlighting
    const styleBase = document.createElement('link');
    styleBase.href = pathDocs + '/prettify.css';
    styleBase.rel = 'stylesheet';

    const styleCustom = document.createElement('link');
	styleCustom.href = pathDocs + '/docs.css';
	styleCustom.rel = 'stylesheet';

    document.head.appendChild(styleBase);
    document.head.appendChild(styleCustom);

    const prettify = document.createElement('script');
    prettify.src = pathDocs + '/prettify.js';

    prettify.onload = function(){
            const elements = document.getElementsByTagName('code');
            console.log('Code:', pathName);

            for (let i = 0; i < elements.length; i ++){
                const e = elements[i];
                e.currentStyle = { 'whiteSpace': 'pre-wrap' }; // Workaround for Firefox, see #30008
                e.className += ' prettyprint';
                e.setAttribute('translate', 'no');
            }
        };

    document.head.appendChild(prettify);
});

class mglDocsPage{
    publicPage(page){
        if(page.title)
            document.title = page.title;

        let html;

        html = `<h1>${page.title}</h1>`;
        html += this.makePage(page);

        const div = document.createElement("div");
        div.innerHTML = html;
        document.body.appendChild(div);
    }

    makePage(page){
        let result = '';

        for(const item of page.data){
            if(item.h1)
                result += `<h1>${item.h1}</h1>`;

            if(item.h2)
                result += `<h2>${item.h2}</h2>`;

            if(item.h3)
                result += `<h3>${item.h3}</h3>`;

            if(item.desc){
                result += this.formatDesc(item.desc);
            }

            if(item.code){
                result += this.formatCode(item.desc);
            }
        }

        return result;
    }

    formatDesc(text){
        // Заменяем два переноса строк на <p>
        let formattedText = text.replace(/(\r?\n){2,}/g, '</p><p>');

        // Заменяем один перенос строки на <br>
        formattedText = formattedText.replace(/(\r?\n)/g, '<br>');

        // Оборачиваем текст в <p> для первого абзаца, если он не пустой
        if(formattedText){
            formattedText = '<p class="desc">' + formattedText + '</p>';
        }

        return formattedText;
    }

    formatCode(text){
        let code = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `<code>${code}</code>`;
    }


};