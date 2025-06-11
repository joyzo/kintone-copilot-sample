import { KintoneService, KintoneConfig } from "./KintoneService";
import { CsvExporter, exportKintoneToCsv } from "./exportCsv";
import * as path from "path";

// Kintone接続設定
const config: KintoneConfig = {
  baseUrl: "https://your-domain.cybozu.com", // あなたのKintoneドメインに変更してください
  auth: {
    apiToken: "your-api-token", // APIトークンを設定してください
    // または、ユーザー名とパスワードを使用する場合:
    // username: 'your-username',
    // password: 'your-password'
  },
};

// KintoneServiceのインスタンスを作成
const kintoneService = new KintoneService(config);

// CSVエクスポートのサンプル関数
async function csvExportSample() {
  try {
    console.log("\n=== KintoneからCSVエクスポートサンプル ===");

    // 1. 基本的なCSVエクスポート（便利関数を使用）
    console.log("\n1. 基本的なCSVエクスポート:");
    const outputPath1 = path.join(process.cwd(), "exports", "kintone_data.csv");
    await exportKintoneToCsv(
      kintoneService,
      1, // アプリID
      outputPath1,
      {
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      }
    );

    // 2. 特定フィールドのみをエクスポート
    console.log("\n2. 特定フィールドのみをエクスポート:");
    const outputPath2 = path.join(
      process.cwd(),
      "exports",
      "filtered_data.csv"
    );
    await exportKintoneToCsv(
      kintoneService,
      1, // アプリID
      outputPath2,
      {
        fields: ["title", "description", "created_time"], // 特定フィールドのみ
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      }
    );

    // 3. 条件付きエクスポート
    console.log("\n3. 条件付きエクスポート:");
    const outputPath3 = path.join(
      process.cwd(),
      "exports",
      "conditional_data.csv"
    );
    await exportKintoneToCsv(
      kintoneService,
      1, // アプリID
      outputPath3,
      {
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      },
      'created_time >= "2024-01-01T00:00:00Z"' // 2024年以降のレコード
    );

    // 4. CsvExporterクラスを直接使用した例
    console.log("\n4. CsvExporterクラスを直接使用:");
    const exporter = new CsvExporter(kintoneService);

    // TSVファイルとして出力
    const outputPath4 = path.join(process.cwd(), "exports", "data.tsv");
    await exporter.exportToCsv(
      1, // アプリID
      {
        outputPath: outputPath4,
        includeHeader: true,
        delimiter: "\t", // タブ区切り
        encoding: "utf8",
      }
    );

    // 5. 複数アプリの一括エクスポート
    console.log("\n5. 複数アプリの一括エクスポート:");
    await exporter.exportMultipleApps(
      [
        {
          app: 1,
          outputPath: path.join(process.cwd(), "exports", "app1_data.csv"),
          query: "limit 100", // 最新100件のみ
        },
        {
          app: 2,
          outputPath: path.join(process.cwd(), "exports", "app2_data.csv"),
        },
      ],
      {
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      }
    );

    console.log("\n✅ 全てのCSVエクスポートが完了しました！");
  } catch (error) {
    console.error("CSVエクスポート中にエラーが発生しました:", error);
  }
}

// レコード取得のサンプル関数
async function main() {
  try {
    console.log("=== Kintoneレコード取得サンプル ===");

    // 1. 単一レコードを取得
    console.log("\n1. 単一レコードの取得:");
    const singleRecord = await kintoneService.getRecord(1, 1); // アプリID: 1, レコードID: 1
    console.log("取得したレコード:", JSON.stringify(singleRecord, null, 2));

    // 2. 複数レコードを検索・取得
    console.log("\n2. 複数レコードの検索・取得:");
    const multipleRecords = await kintoneService.getRecords(
      1, // アプリID
      "", // クエリ（空の場合は全レコード取得）
      undefined, // フィールド指定（undefinedの場合は全フィールド取得）
      true // 総件数も取得
    );
    console.log(`総件数: ${multipleRecords.totalCount}`);
    console.log("取得したレコード一覧:");
    multipleRecords.records.forEach((record, index) => {
      console.log(`レコード ${index + 1}:`, JSON.stringify(record, null, 2));
    });

    // 3. 条件を指定してレコードを検索
    console.log("\n3. 条件付きでレコードを検索:");
    const filteredRecords = await kintoneService.getRecords(
      1, // アプリID
      'title like "サンプル"', // クエリ例：titleフィールドに「サンプル」が含まれるレコード
      ["title", "created_time"], // 特定のフィールドのみ取得
      true
    );
    console.log(`条件に一致するレコード数: ${filteredRecords.totalCount}`);
    filteredRecords.records.forEach((record, index) => {
      console.log(
        `フィルター済みレコード ${index + 1}:`,
        JSON.stringify(record, null, 2)
      );
    });
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

// 実行
if (require.main === module) {
  Promise.all([main(), csvExportSample()]).catch(console.error);
}

// エクスポート（他のファイルから使用する場合）
export { kintoneService, main, csvExportSample };
