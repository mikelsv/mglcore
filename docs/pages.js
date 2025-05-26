document.addEventListener("DOMContentLoaded", function() {
    console.log("Страница загружена и разобрана.");

    const elements = document.getElementsByTagName( 'code' );
    console.log(123);

    for(let i = 0; i < elements.length; i ++ ){ console.log(i);
        const e = elements[ i ];
        e.currentStyle = { 'whiteSpace': 'pre-wrap' }; // Workaround for Firefox, see #30008
        e.className += ' prettyprint';
        e.setAttribute( 'translate', 'no' );
    }


});

