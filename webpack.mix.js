let mix = require('laravel-mix');

mix.setPublicPath('dist')
    .js('src/js/app.js', '')
    .sass('src/sass/styles.scss', '');