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