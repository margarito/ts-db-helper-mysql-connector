import { MySQLCreate } from './mysql-create';
import { TsDbHelperDatabaseInfo } from './ts-db-helper-database-info';
import { MysqlQueryResultWrapper } from './mysql-query-result-wrapper';
import { TsDbHelperMySQLConnectorConfigurator } from './ts-db-helper-mysql-connector-configurator';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import {
    DataModel,
    DbQuery,
    ModelManager,
    ModelMigration,
    QueryConnector,
    QueryError,
    QueryResult,
    Select,
} from 'ts-db-helper';
import { createPool, IConnection, IError, IFieldInfo, IPool } from 'mysql';

import 'rxjs/add/Observable/concat';

export class TsDbHelperMySQLConnector implements QueryConnector, ModelMigration {
    /**
     * @private
     * @property {boolean} ready, flag updated with connector state to indicate that connector can query
     */
    private ready = true;
    /**
     * @private
     * @property {Database} dbValue @see Websql
     */
    private connectionPoolValue: IPool;

    /**
     * @private
     * @property {Database} db getter that open database on demand
     */
    private get pool(): IPool {
        if (!this.connectionPoolValue) {
            // this.connectionValue = get mysql connection;
            this.connectionPoolValue = createPool(this.config.options);
        }
        return this.connectionPoolValue;
    }

    public constructor(private config: TsDbHelperMySQLConnectorConfigurator) {
        if (this.pool) {
            this.pool.on('acquire', (connection: IConnection) => this.onPoolAcquire(connection));
            this.pool.on('connection', (connection: IConnection) => this.onPoolConnection(connection));
            this.pool.on('enqueue', () => this.onPoolEnqueue());
            this.pool.on('release', (connection: IConnection) => this.onPoolRelease(connection));
        }
    }

    private onPoolAcquire(connection: IConnection) {

    }

    private onPoolConnection(connection: IConnection) {

    }

    private onPoolEnqueue() {

    }

    private onPoolRelease(connection: IConnection) {

    }

    public query(dbQuery: DbQuery): Observable<QueryResult<any>> {
        return this.stdQuery(dbQuery.query, dbQuery.params).map((results: any) => {
            return new MysqlQueryResultWrapper(results);
        });
    }

    /**
     * @public
     * @method queryBatch connector method to fire many queries in a single transaction
     *
     * @param {DbQuery} dbQueries   DbQuery object containing query and query params.
     *
     * @return {Obsevable<QueryResult<any>>}    passing {@link QueryResult<any>} on query success
     *                                          passing {@link QueryError} on query error
     */
    public queryBatch(dbQueries: DbQuery[]): Observable<QueryResult<any>> {
        return Observable.create((observer: Observer<QueryResult<any>>) => {
        });
    }

    /**
     * @method isReady to check if module is ready, if not, caller should
     * subscribe to {@link QueryConnector.onReady}
     *
     * @return {boolean} should be true if connector can query else false
     */
    public isReady(): boolean {
        return this.ready;
    }

    /**
     * @method onReady should be subscribed if connector is not ready
     * if connector is ready, if QueryConnector isReady or not this should be
     * a permanent state. The engine never resubscribe in his instance lifecycle.
     *
     * @return {Observable<boolean>}    passing true if connector is ready
     *                                  passing false if connector will never be ready
     */
    public onReady(): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {
            observer.next(this.ready);
            observer.complete();
        });
    }

    private stdQuery(query: string, params: any[] = []): Observable<any> {
        return Observable.create((observer: Observer<QueryResult<any>>) => {
            this.pool.query(query, params, (err: IError, results?: any, fields?: IFieldInfo[]) => {
                if (err) {
                    const qErr = new QueryError(err.message, err.sql ? err.sql : query, params.join(', '));
                    qErr.stack = err.stack;
                    console.error(qErr);
                    observer.error(qErr);
                } else {
                    observer.next(results);
                    observer.complete();
                }
            });
        });
    }

    public changeVersion(oldVersion: string, newVersion: string): Observable<any> {
        const tableName = ModelManager.getInstance().getTable(TsDbHelperDatabaseInfo);
        let changeVersionObsable = null;
        if (oldVersion === newVersion) {
            changeVersionObsable = Observable.from([null]);
        } else {
            changeVersionObsable =
                this.stdQuery('INSERT INTO ' + tableName + ' (`key`, `value`) VALUES (\'version\', ?) ON DUPLICATE KEY UPDATE `value`=?',
                [newVersion, newVersion]);
        }
        if (oldVersion === null || oldVersion === undefined) {
            const tableInfoModel = ModelManager.getInstance().getModel(TsDbHelperDatabaseInfo);
            const q = MySQLCreate(tableInfoModel);
            const createObservable = this.stdQuery(q, []);
            return Observable.concat(createObservable, changeVersionObsable);
        } else {
            return changeVersionObsable;
        }
    }

    public checkIfTableExists(tableName: string): Observable<boolean> {
        return this.stdQuery('show tables like ?', [tableName]).map((results: any) => {
            return !!results.length;
        });
    }

    /**
     * @method getDbVersion called to check db version, should be called only if connector
     * is ready. The rdb may need a query so the call is async.
     *
     * @return {Observable<string>}     passing string version after version is checked
     */
    public getDbVersion(): Observable<string> {
        const tableName = ModelManager.getInstance().getTable(TsDbHelperDatabaseInfo);
        return this.checkIfTableExists(tableName).switchMap((exists: boolean) => {
            if (exists) {
                const getVersionQuery = Select(TsDbHelperDatabaseInfo).where({key: 'version'}).build();
                return this.stdQuery(getVersionQuery.query, getVersionQuery.params).map((results: any) => {
                    if (results.length) {
                        return results[0].value as string;
                    } else {
                        return '';
                    }
                });
            } else {
                return Observable.from(['']);
            }
        });
    }

    /**
     * @method initModel is a method called when model should be created
     *
     * @param {DataModel} dataModel data model generated with model annotations
     *
     * @return {Observable<any>} resolved on initModel finish, not value is waited
     */
    public initModel(dataModel: DataModel): Observable<any> {
        return this.config.initModel(dataModel, this);
    }

    /**
     * @method upgradeModel is a method called when model should be upgrade
     *
     * @param {DataModel} dataModel data model generated with model annotations
     *
     * @return {Observable<any>} resolved on initModel finish, not value is waited
     */
    public upgradeModel(dataModel: DataModel, oldVersion: string): Observable<any> {
        return this.config.upgradeModel(dataModel, oldVersion, this);
    }
}
