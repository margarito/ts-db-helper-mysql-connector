import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'dist/index.js',
    sourceMap: false,
    output: {
        format: 'umd',
        file: 'dist/bundles/ts-db-helper-mysql-connector.umd.js',
    },
    name: 'TsDbHelper',
    globals: {
        'mysql': 'mysql',
        'ts-db-helper': 'TsDbHelper',
        'rxjs/Observable': 'Rx',
        'rxjs/Observer': 'Rx',
        'rxjs/Subject': 'Rx',
        'rxjs/add/operator/combineLatest': 'Rx.Observable.prototype',
        'rxjs/add/operator/share': 'Rx.Observable.prototype',
        'rxjs/add/operator/map': 'Rx.Observable.prototype',
        'rxjs/add/operator/switchMap': 'Rx.Observable.prototype',
        'rxjs/add/operator/catch': 'Rx.Observable.prototype',
        'rxjs/add/Observable/from': 'Rx.Observable.prototype',
        'rxjs/add/Observable/empty': 'Rx.Observable.prototype',
        'rxjs/add/Observable/concat': 'Rx.Observable.prototype',
        'rxjs/add/Observable/combineLatest': 'Rx.Observable.prototype',
    },
    external: [
        'mysql',
        'ts-db-helper',
        'rxjs/Observable',
        'rxjs/Observer',
        'rxjs/Subject',
        'rxjs/add/observable/combineLatest',
        'rxjs/add/operator/map',
        'rxjs/add/operator/share',
        'rxjs/add/operator/switchMap',
        'rxjs/add/operator/catch',
        'rxjs/add/Observable/from',
        'rxjs/add/Observable/empty',
        'rxjs/add/Observable/concat',
        'rxjs/add/Observable/combineLatest'
    ],
    plugins: [
        typescript({
            typescript: require('typescript')
        })
    ]
};