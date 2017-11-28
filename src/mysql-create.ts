import { ModelManager } from 'ts-db-helper/src/core/managers/model-manager';
import { DbHelperModel, DbTable } from 'ts-db-helper';

export function MySQLCreate(table: DbTable): string {
    const columns = [];
    let hasAutoincrement = false;
    for (const column of table.columnList) {
        if (column.autoIncrement) {
            hasAutoincrement = true;
        }
        if (column.type && column.type.toLowerCase() === 'string') {
            column.type = 'VARCHAR(255)';
        }
        let value = '`' + column.name + '` ' + (column.autoIncrement ? 'INTEGER' : column.type);
        value += (column.primaryKey ? ' PRIMARY KEY' : '');
        value += (column.autoIncrement ? ' AUTO_INCREMENT' : '');
        columns.push(value);
    }
    if (!hasAutoincrement) {
        const rowid = '`rowid` INTEGER AUTO_INCREMENT';
        columns.push(rowid);
    }
    const query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(', ') + (hasAutoincrement ? ')' : ', INDEX(rowid))');
    return query;
}
