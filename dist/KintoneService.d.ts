export interface KintoneConfig {
    baseUrl: string;
    auth: {
        username?: string;
        password?: string;
        apiToken?: string;
    };
}
export interface KintoneRecord {
    [key: string]: any;
}
export interface KintoneApp {
    app: string | number;
}
export declare class KintoneService {
    private client;
    constructor(config: KintoneConfig);
    /**
     * レコードを取得する
     */
    getRecord(app: string | number, id: string | number): Promise<KintoneRecord>;
    /**
     * レコードを作成する
     */
    createRecord(app: string | number, record: KintoneRecord): Promise<{
        id: string;
        revision: string;
    }>;
    /**
     * レコードを更新する
     */
    updateRecord(app: string | number, id: string | number, record: KintoneRecord, revision?: string): Promise<{
        revision: string;
    }>;
    /**
     * レコードを削除する
     */
    deleteRecord(app: string | number, id: string | number, revision?: string): Promise<void>;
    /**
     * レコードを検索する
     */
    getRecords(app: string | number, query?: string, fields?: string[], totalCount?: boolean): Promise<{
        records: KintoneRecord[];
        totalCount?: string;
    }>;
}
//# sourceMappingURL=KintoneService.d.ts.map