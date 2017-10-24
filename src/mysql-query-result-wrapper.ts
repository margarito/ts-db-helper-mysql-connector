import { QueryResult } from 'ts-db-helper';

export class MysqlQueryResultWrapper implements QueryResult<any> {
    private results: any = null;

    public get rowsAffected(): number {
        return this.results ? this.results.affectedRows : null;
    }

    public get insertId(): number {
        return this.results ? this.results.insertId : null;
    }

    /**
     * rows:    */
    public rows = {
        get length(): number {
            return this.results ? this.results.length : 0;
        },

        item(index: number): any {
            return this.results[index];
        },

        toArray(): any[] {
            return this.results ? this.results : [];
        }
    };

    public constructor(results: any) {
        this.results = results;
    }
}
