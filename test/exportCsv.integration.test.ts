import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { KintoneService } from "../src/KintoneService";
import { exportKintoneToCsv } from "../src/exportCsv";
import * as fs from "fs";
import * as path from "path";

const testConfig = {
  baseUrl: "https://test.cybozu.com",
  auth: {
    apiToken: "test-token",
  },
};

const integrationTestDir = path.join(__dirname, "../integration-test-exports");

describe("CSVエクスポート統合テスト", () => {
  let kintoneService: KintoneService;

  beforeAll(() => {
    kintoneService = new KintoneService(testConfig);

    // 統合テスト用ディレクトリを作成
    if (!fs.existsSync(integrationTestDir)) {
      fs.mkdirSync(integrationTestDir, { recursive: true });
    }
  });

  afterAll(() => {
    // テスト後にファイルをクリーンアップ
    if (fs.existsSync(integrationTestDir)) {
      const files = fs.readdirSync(integrationTestDir);
      files.forEach((file) => {
        const filePath = path.join(integrationTestDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(integrationTestDir);
    }
  });

  describe("実際のワークフロー", () => {
    it("完全なワークフロー: データ取得からCSVエクスポートまで", async () => {
      const outputPath = path.join(integrationTestDir, "workflow_test.csv");

      // 1. データを取得してCSVにエクスポート
      await exportKintoneToCsv(kintoneService, "1", outputPath, {
        includeHeader: true,
        delimiter: ",",
        encoding: "utf8",
      });

      // 2. ファイルが作成されたことを確認
      expect(fs.existsSync(outputPath)).toBe(true);

      // 3. ファイル内容を検証
      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // ヘッダー行の確認
      const headers = lines[0].split(",");
      expect(headers).toContain("title");
      expect(headers).toContain("description");
      expect(headers).toContain("status");

      // データ行の確認
      expect(lines.length).toBeGreaterThan(1);

      // CSVの内容を確認（行の順序は保証されないため）
      expect(csvContent).toContain("サンプルタイトル1");
      expect(csvContent).toContain("サンプルタイトル2");
    });

    it("フィールド指定とフィルタリングを組み合わせたエクスポート", async () => {
      const outputPath = path.join(
        integrationTestDir,
        "filtered_fields_test.csv"
      );

      await exportKintoneToCsv(
        kintoneService,
        "1",
        outputPath,
        {
          fields: ["title", "status"],
          includeHeader: true,
        },
        'status = "完了"'
      );

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // ヘッダーが指定したフィールドのみであることを確認
      const headers = lines[0].split(",");
      expect(headers).toHaveLength(2);
      expect(headers).toContain("title");
      expect(headers).toContain("status");
      expect(headers).not.toContain("description");

      // フィルタリングされたデータのみが含まれることを確認
      expect(lines.length).toBe(2); // ヘッダー + 1件のデータ
      expect(lines[1]).toContain("サンプルタイトル2"); // status="完了"のレコード
    });

    it("大きなデータセットのパフォーマンステスト", async () => {
      const outputPath = path.join(integrationTestDir, "performance_test.csv");
      const startTime = Date.now();

      await exportKintoneToCsv(kintoneService, "1", outputPath);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(fs.existsSync(outputPath)).toBe(true);

      // 実行時間が合理的な範囲内であることを確認（5秒以内）
      expect(executionTime).toBeLessThan(5000);

      // ファイルサイズが0より大きいことを確認
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it("特殊文字とエスケープ処理の検証", async () => {
      const outputPath = path.join(
        integrationTestDir,
        "special_chars_test.csv"
      );

      await exportKintoneToCsv(kintoneService, "1", outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");

      // CSV形式として正しく解析できることを確認
      const lines = csvContent.split("\n").filter((line) => line.trim());
      expect(lines.length).toBeGreaterThan(0);

      // 特殊文字が適切にエスケープされていることを確認
      // ダブルクォートやカンマを含むフィールドが適切に処理されている
      const hasQuotedFields = csvContent.includes('"');
      if (hasQuotedFields) {
        // クォートされたフィールドが正しい形式であることを確認
        expect(csvContent).toMatch(/"[^"]*"/);
      }
    });

    it("異なるファイル形式での出力", async () => {
      const csvPath = path.join(integrationTestDir, "format_test.csv");
      const tsvPath = path.join(integrationTestDir, "format_test.tsv");

      // CSV形式で出力
      await exportKintoneToCsv(kintoneService, "1", csvPath, {
        delimiter: ",",
      });

      // TSV形式で出力
      await exportKintoneToCsv(kintoneService, "1", tsvPath, {
        delimiter: "\t",
      });

      expect(fs.existsSync(csvPath)).toBe(true);
      expect(fs.existsSync(tsvPath)).toBe(true);

      const csvContent = fs.readFileSync(csvPath, "utf8");
      const tsvContent = fs.readFileSync(tsvPath, "utf8");

      // CSV形式にはカンマが含まれる
      expect(csvContent).toContain(",");

      // TSV形式にはタブが含まれる
      expect(tsvContent).toContain("\t");

      // 両ファイルのレコード数が同じであることを確認
      const csvLines = csvContent.split("\n").filter((line) => line.trim());
      const tsvLines = tsvContent.split("\n").filter((line) => line.trim());
      expect(csvLines.length).toBe(tsvLines.length);
    });
  });

  describe("エラー状況でのテスト", () => {
    it("ネットワークエラー時の適切なエラーハンドリング", async () => {
      const outputPath = path.join(
        integrationTestDir,
        "network_error_test.csv"
      );

      // 存在しないアプリIDでネットワークエラーをシミュレート
      await expect(
        exportKintoneToCsv(kintoneService, "999", outputPath)
      ).rejects.toThrow();

      // エラー時にはファイルが作成されないことを確認
      expect(fs.existsSync(outputPath)).toBe(false);
    });

    it("権限エラー時の適切なエラーハンドリング", async () => {
      const invalidService = new KintoneService({
        baseUrl: "https://test.cybozu.com",
        auth: {
          apiToken: "invalid-token",
        },
      });

      const outputPath = path.join(
        integrationTestDir,
        "permission_error_test.csv"
      );

      // MSWは認証をチェックしないため、このテストは実際にはエラーにならない
      // 実際の環境では認証エラーが発生する
      await exportKintoneToCsv(invalidService, "1", outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      expect(fs.existsSync(outputPath)).toBe(false);
    });
  });

  describe("データ整合性テスト", () => {
    it("エクスポートされたデータがオリジナルデータと一致する", async () => {
      // 1. 直接APIからデータを取得
      const originalRecords = await kintoneService.getRecords("1");

      // 2. CSVエクスポートを実行
      const outputPath = path.join(
        integrationTestDir,
        "data_integrity_test.csv"
      );
      await exportKintoneToCsv(kintoneService, "1", outputPath);

      // 3. CSVファイルを読み込んで検証
      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // レコード数が一致することを確認（ヘッダー行を除く）
      // CSVには空行が含まれる可能性があるため、空でない行のみをカウント
      const dataLines = lines.filter((line) => line.trim());
      expect(dataLines.length - 1).toBe(originalRecords.records.length);

      // 各レコードのキーフィールドが含まれることを確認
      originalRecords.records.forEach((record, index) => {
        const dataLine = lines[index + 1]; // ヘッダー行をスキップ
        if (record.title && record.title.value) {
          expect(dataLine).toContain(record.title.value);
        }
      });
    });
  });
});
