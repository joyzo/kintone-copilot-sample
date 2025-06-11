import { KintoneService, KintoneConfig } from "./KintoneService";
import { CsvExporter, exportKintoneToCsv } from "./exportCsv";
import * as path from "path";

/**
 * CSVエクスポートの使用例
 *
 * このファイルは、KintoneからデータをCSVファイルにエクスポートする
 * 様々な方法を示しています。
 */

// Kintone接続設定（実際の値に変更してください）
const config: KintoneConfig = {
  baseUrl: "https://your-domain.cybozu.com",
  auth: {
    apiToken: "your-api-token",
  },
};

const kintoneService = new KintoneService(config);

async function runExamples() {
  try {
    console.log("=== CSVエクスポート使用例 ===\n");

    // 例1: 最もシンプルな使用方法
    console.log("例1: 最もシンプルな使用方法");
    await exportKintoneToCsv(
      kintoneService,
      1, // アプリID
      "./exports/simple_export.csv"
    );
    console.log("✓ simple_export.csv を出力しました\n");

    // 例2: オプションを指定したエクスポート
    console.log("例2: オプションを指定したエクスポート");
    await exportKintoneToCsv(
      kintoneService,
      1,
      "./exports/detailed_export.csv",
      {
        fields: ["title", "description", "status"], // 特定フィールドのみ
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      }
    );
    console.log("✓ detailed_export.csv を出力しました\n");

    // 例3: 条件を指定してエクスポート
    console.log("例3: 条件を指定してエクスポート");
    await exportKintoneToCsv(
      kintoneService,
      1,
      "./exports/filtered_export.csv",
      {
        includeHeader: true,
      },
      'status = "完了"' // 完了したレコードのみ
    );
    console.log("✓ filtered_export.csv を出力しました\n");

    // 例4: TSVファイルとしてエクスポート
    console.log("例4: TSVファイルとしてエクスポート");
    const exporter = new CsvExporter(kintoneService);
    await exporter.exportToCsv(1, {
      outputPath: "./exports/data.tsv",
      delimiter: "\t", // タブ区切り
      includeHeader: true,
    });
    console.log("✓ data.tsv を出力しました\n");

    // 例5: 複数アプリの一括エクスポート
    console.log("例5: 複数アプリの一括エクスポート");
    await exporter.exportMultipleApps(
      [
        {
          app: 1,
          outputPath: "./exports/app1_export.csv",
          query: "limit 50", // 最新50件
        },
        {
          app: 2,
          outputPath: "./exports/app2_export.csv",
        },
      ],
      {
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      }
    );
    console.log("✓ 複数アプリのエクスポートが完了しました\n");

    console.log("🎉 全ての例が正常に実行されました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);

    // よくあるエラーとその対処法
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        console.log(
          "\n💡 認証エラーです。APIトークンまたはユーザー名・パスワードを確認してください。"
        );
      } else if (error.message.includes("404")) {
        console.log(
          "\n💡 アプリが見つかりません。アプリIDを確認してください。"
        );
      } else if (error.message.includes("ENOENT")) {
        console.log(
          "\n💡 出力ディレクトリが存在しません。exportsディレクトリを作成してください。"
        );
      }
    }
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  runExamples();
}

export { runExamples };
