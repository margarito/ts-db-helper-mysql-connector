import { Create, DataModel, DbQuery, QueryError } from 'ts-db-helper';
import { IPoolConfig } from 'mysql';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import 'rxjs/add/Observable/concat';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/Observable/combineLatest';

export class PoolOptions implements IPoolConfig {
    // db connection options
    public host = 'localhost';
    public port = 3306;
    public database: string | undefined;
    public localAddress?: string;
    public socketPath?: string;
    public user: string | undefined;
    public password: string | undefined;
    public charset = 'UTF8_GENERAL_CI';
    public timezone = 'local';
    public connectTimeout = 10000;
    public stringifyObjects = false;
    public insecureAuth = false;
    public typeCast = true;
    public queryFormat?: (query: string, values: any) => void;
    public supportBigNumbers = false;
    public dateStrings = false;
    public debug: boolean | string[] = false;
    public trace = true;
    public multipleStatements = false;
    public flags?: string[];
    public ssl?: any;

    // specifics pool options
    public acquireTimeout = 10000;
    public waitForConnections = true;
    public connectionLimit = 10;
    public queueLimit = 0;
}

export class TsDbHelperMySQLConnectorConfigurator {

    public options = new PoolOptions();

    /**
     * initModel
     */
    public initModel(dataModel: DataModel, connector: any): Observable<any> {
        return this.createTables(dataModel, connector, null, true);
    }

    public upgradeModel(dataModel: DataModel, oldVersion: string, connector: any): Observable<any> {
        return this.createTables(dataModel, connector, oldVersion, false);
    }

    private createTables(dataModel: DataModel, connector: any, oldVersion: string | null, doDrop: boolean = false): Observable<any> {
        let dbQuery: string;

        const createObservable = Observable.create((observer: Observer<any>) => {
            console.log(dataModel);
            connector.changeVersion(oldVersion, dataModel.version).switchMap((results: any) => {
                const observables = [];
                for (const table of dataModel.tables) {
                    dbQuery = Create(table).build();
                    observables.push(connector.query(dbQuery));
                    console.log(dbQuery);
                }
                return Observable.combineLatest(observables);
            });
        });
        if (doDrop) {
            return Observable.concat(this.dropTables(dataModel, connector), createObservable);
        } else {
            return createObservable;
        }
    }

    private dropTables(dataModel: DataModel, connector: any): Observable<any> {
        const observables = [];
        for (const table of dataModel.tables) {
            observables.push(this.dropTable(table.name, connector));
        }
        return Observable.combineLatest(observables);
    }

    private dropTable(tableName: string, connector: any): Observable<any> {
        const dbQuery = new DbQuery();
        dbQuery.query = 'DROP TABLE IF EXISTS `' + tableName + '`';
        dbQuery.params = [];
        return connector.query(dbQuery);
    }
}
