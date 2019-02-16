window.jQuery = window.$ = require('jquery'); // We need to expose jQuery as global variable
window.Analyzer = require('./analyzer');
window.Renderings = require('./renderings');
require('bootstrap-sass')

// bind input change
const inputEl = $('input[type="file"]');
const errorEl = $('#errors');
const uploadBtnEl = $('#upload-btn');
const showError = err => {
    errorEl.removeClass('hidden').children('span').html(err);
},
    cleanError = () => { errorEl.addClass('hidden').children('span').html(''); }

uploadBtnEl.on('click', e => {
    inputEl.trigger('click');    
});
inputEl.on('change', e => {
    let file = inputEl[0].files[0];
    if (typeof file === 'undefined' || file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
        showError('¯\\_(ツ)_/¯ Invalid File!')
        return;
    }
    Analyzer.default(file).then( resp => {
        cleanError();
        console.log(resp);
        Renderings.default(resp);
    })
    .catch( err => {
        showError('An error occured, just try again, maybe you got an invalid file? who knows.. it takes time to debug ¯\\_(ツ)_/¯')
        console.error(err)
    });
    
})