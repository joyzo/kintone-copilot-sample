"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KintoneService = void 0;
const rest_api_client_1 = require("@kintone/rest-api-client");
class KintoneService {
    constructor(config) {
        this.client = new rest_api_client_1.KintoneRestAPIClient({
            baseUrl: config.baseUrl,
            auth: config.auth,
        });
    }
    /**
     * レコードを取得する
     */
    async getRecord(app, id) {
        const response = await this.client.record.getRecord({
            app,
            id,
        });
        return response.record;
    }
    /**
     * レコードを作成する
     */
    async createRecord(app, record) {
        const response = await this.client.record.addRecord({
            app,
            record,
        });
        return {
            id: response.id,
            revision: response.revision,
        };
    }
    /**
     * レコードを更新する
     */
    async updateRecord(app, id, record, revision) {
        const response = await this.client.record.updateRecord({
            app,
            id,
            record,
            revision,
        });
        return {
            revision: response.revision,
        };
    }
    /**
     * レコードを削除する
     */
    async deleteRecord(app, id, revision) {
        await this.client.record.deleteRecords({
            app,
            ids: [id],
            revisions: revision ? [revision] : undefined,
        });
    }
    /**
     * レコードを検索する
     */
    async getRecords(app, query, fields, totalCount) {
        const response = await this.client.record.getRecords({
            app,
            query,
            fields,
            totalCount,
        });
        return {
            records: response.records,
            totalCount: response.totalCount || undefined,
        };
    }
}
exports.KintoneService = KintoneService;
//# sourceMappingURL=KintoneService.js.map