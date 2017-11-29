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
        length: 0,

        item(index: number): any {
            return null;
        },

        toArray(): any[] {
            return [];
        }
    };

    public constructor(results: any) {
        this.results = results;
        this.rows.length = results.length;
        this.rows.item = (index: number): any => {
            return results[index];
        };
        this.rows.toArray = (): any[] => {
            return results ? results : [];
        };
    }
}
