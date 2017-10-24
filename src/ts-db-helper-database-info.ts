import { Column, DbHelperModel, PrimaryKey, Table } from 'ts-db-helper';

@Table({
    name: 'TS_DB_HELPER_DATABASE_INFO'
})
export class TsDbHelperDatabaseInfo extends DbHelperModel {

    @PrimaryKey({autoIncrement: true})
    public id: number;

    @Column({unique: true})
    public key: string;

    @Column()
    public value: string;
}
