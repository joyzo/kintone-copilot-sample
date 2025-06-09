"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KintoneService = void 0;
const KintoneService_1 = require("./KintoneService");
Object.defineProperty(exports, "KintoneService", { enumerable: true, get: function () { return KintoneService_1.KintoneService; } });
// 使用例
async function main() {
    // Kintoneサービスのインスタンスを作成
    const kintoneService = new KintoneService_1.KintoneService({
        baseUrl: "https://your-domain.cybozu.com",
        auth: {
            apiToken: "your-api-token",
        },
    });
    try {
        // レコードを作成
        console.log("レコードを作成中...");
        const createResult = await kintoneService.createRecord("1", {
            title: { value: "TypeScriptからのレコード" },
            description: {
                value: "TypeScriptとREST APIクライアントを使って作成されたレコードです。",
            },
        });
        console.log("作成されたレコードID:", createResult.id);
        // レコードを取得
        console.log("レコードを取得中...");
        const record = await kintoneService.getRecord("1", createResult.id);
        console.log("取得したレコード:", record);
        // レコードを更新
        console.log("レコードを更新中...");
        const updateResult = await kintoneService.updateRecord("1", createResult.id, {
            title: { value: "更新されたタイトル" },
        });
        console.log("更新されたリビジョン:", updateResult.revision);
        // レコード一覧を取得
        console.log("レコード一覧を取得中...");
        const records = await kintoneService.getRecords("1", undefined, undefined, true);
        console.log(`取得したレコード数: ${records.records.length}/${records.totalCount}`);
        // レコードを削除
        console.log("レコードを削除中...");
        await kintoneService.deleteRecord("1", createResult.id);
        console.log("レコードが削除されました");
    }
    catch (error) {
        console.error("エラーが発生しました:", error);
    }
}
// 直接実行される場合のみmain関数を呼び出す
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map