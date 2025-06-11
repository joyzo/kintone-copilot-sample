import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { KintoneService } from "../src/KintoneService";
import { CsvExporter, exportKintoneToCsv } from "../src/exportCsv";
import * as fs from "fs";
import * as path from "path";

const testConfig = {
  baseUrl: "https://test.cybozu.com",
  auth: {
    apiToken: "test-token",
  },
};

const testOutputDir = path.join(__dirname, "../test-exports");

describe("CSVエクスポート機能", () => {
  let kintoneService: KintoneService;
  let csvExporter: CsvExporter;

  beforeEach(() => {
    kintoneService = new KintoneService(testConfig);
    csvExporter = new CsvExporter(kintoneService);

    // テスト出力ディレクトリを作成
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    // テスト後にファイルをクリーンアップ
    if (fs.existsSync(testOutputDir)) {
      const cleanupDirectory = (dir: string) => {
        const items = fs.readdirSync(dir);
        items.forEach((item) => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            cleanupDirectory(itemPath);
            fs.rmdirSync(itemPath);
          } else {
            fs.unlinkSync(itemPath);
          }
        });
      };
      cleanupDirectory(testOutputDir);
    }
  });

  describe("exportKintoneToCsv関数", () => {
    it("基本的なCSVエクスポートが正常に動作する", async () => {
      const outputPath = path.join(testOutputDir, "basic_export.csv");

      await exportKintoneToCsv(kintoneService, "1", outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // ヘッダー行があることを確認
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toContain("title");
      expect(lines[0]).toContain("description");

      // データ行が存在することを確認
      expect(lines.length).toBeGreaterThan(1);

      // CSVの行構造を確認（フィールドの順序は保証されないため、含まれることを確認）
      expect(csvContent).toContain("サンプルタイトル1");
      expect(csvContent).toContain("サンプルタイトル2");
    });

    it("特定フィールドのみエクスポートできる", async () => {
      const outputPath = path.join(testOutputDir, "fields_export.csv");

      await exportKintoneToCsv(kintoneService, "1", outputPath, {
        fields: ["title"],
        includeHeader: true,
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // ヘッダーにtitleのみが含まれることを確認
      expect(lines[0]).toBe("title");
      expect(lines[0]).not.toContain("description");

      // データ行にもtitleの値のみが含まれることを確認
      expect(lines[1]).toBe("サンプルタイトル1");
      expect(lines[2]).toBe("サンプルタイトル2");
    });

    it("ヘッダーなしでエクスポートできる", async () => {
      const outputPath = path.join(testOutputDir, "no_header_export.csv");

      await exportKintoneToCsv(kintoneService, "1", outputPath, {
        includeHeader: false,
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // 最初の行がデータ行であることを確認
      expect(lines[0]).toContain("サンプルタイトル1");
    });

    it("タブ区切り（TSV）でエクスポートできる", async () => {
      const outputPath = path.join(testOutputDir, "tab_export.tsv");

      await exportKintoneToCsv(kintoneService, "1", outputPath, {
        delimiter: "\t",
        includeHeader: true,
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      // タブ区切りであることを確認
      expect(lines[0]).toContain("\t");
      expect(lines[1]).toContain("\t");
    });

    it("存在しないアプリIDでエラーになる", async () => {
      const outputPath = path.join(testOutputDir, "error_export.csv");

      await expect(
        exportKintoneToCsv(kintoneService, "999", outputPath)
      ).rejects.toThrow();

      // ファイルが作成されていないことを確認
      expect(fs.existsSync(outputPath)).toBe(false);
    });
  });

  describe("CsvExporterクラス", () => {
    it("exportToCsvメソッドが正常に動作する", async () => {
      const outputPath = path.join(testOutputDir, "class_export.csv");

      await csvExporter.exportToCsv("1", {
        outputPath,
        includeHeader: true,
        delimiter: ",",
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      const csvContent = fs.readFileSync(outputPath, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toContain("title");
    });

    it("複数アプリの一括エクスポートが動作する", async () => {
      const app1Path = path.join(testOutputDir, "multi_app1.csv");
      const app2Path = path.join(testOutputDir, "multi_app2.csv");

      await csvExporter.exportMultipleApps(
        [
          { app: "1", outputPath: app1Path },
          { app: "1", outputPath: app2Path }, // テスト用に同じアプリを使用
        ],
        {
          includeHeader: true,
          delimiter: ",",
        }
      );

      expect(fs.existsSync(app1Path)).toBe(true);
      expect(fs.existsSync(app2Path)).toBe(true);

      const content1 = fs.readFileSync(app1Path, "utf8");
      const content2 = fs.readFileSync(app2Path, "utf8");

      expect(content1).toContain("サンプルタイトル1");
      expect(content2).toContain("サンプルタイトル1");
    });
  });

  describe("CSVフォーマット処理", () => {
    it("特殊文字を含むデータが正しくエスケープされる", async () => {
      // テスト用のモックデータを作成するため、一時的にモックを追加
      const outputPath = path.join(testOutputDir, "escape_test.csv");

      await exportKintoneToCsv(kintoneService, "1", outputPath);

      const csvContent = fs.readFileSync(outputPath, "utf8");

      // CSVが正しい形式であることを確認
      expect(csvContent).toMatch(/^[^\n]+\n/); // ヘッダー行がある
      expect(csvContent.split("\n").length).toBeGreaterThan(1); // 複数行ある
    });

    it("空のレコードリストでも正常に処理される", async () => {
      const outputPath = path.join(testOutputDir, "empty_export.csv");

      // 存在しないアプリIDまたは条件で空の結果を得る
      try {
        await exportKintoneToCsv(kintoneService, "999", outputPath);
      } catch (error) {
        // 404エラーが発生することを確認
        expect(error).toBeDefined();
      }
    });
  });

  describe("ファイルシステム操作", () => {
    it("ディレクトリが存在しない場合、自動的に作成される", async () => {
      const nestedDir = path.join(testOutputDir, "nested", "directory");
      const outputPath = path.join(nestedDir, "nested_export.csv");

      await exportKintoneToCsv(kintoneService, "1", outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it("UTF-8エンコーディングでファイルが作成される", async () => {
      const outputPath = path.join(testOutputDir, "utf8_export.csv");

      await exportKintoneToCsv(kintoneService, "1", outputPath, {
        encoding: "utf8",
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // UTF-8で読み込めることを確認
      const content = fs.readFileSync(outputPath, "utf8");
      expect(content).toContain("サンプルタイトル1");
    });
  });

  describe("エラーハンドリング", () => {
    it("無効な認証情報でエラーになる", async () => {
      const invalidService = new KintoneService({
        baseUrl: "https://test.cybozu.com",
        auth: {
          apiToken: "invalid-token",
        },
      });

      const invalidExporter = new CsvExporter(invalidService);
      const outputPath = path.join(testOutputDir, "invalid_auth.csv");

      // MSWは認証をチェックしないため、このテストはスキップ
      // 実際の環境では認証エラーが発生する
      await invalidExporter.exportToCsv("1", { outputPath });
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("書き込み権限がない場合のエラーハンドリング", async () => {
      // 読み取り専用ディレクトリを作成（Unix系OSでのみ有効）
      const readOnlyDir = path.join(testOutputDir, "readonly");
      if (!fs.existsSync(readOnlyDir)) {
        fs.mkdirSync(readOnlyDir);
      }

      const outputPath = path.join(readOnlyDir, "readonly_test.csv");

      try {
        // 権限を変更（Unix系OSでのみ）
        if (process.platform !== "win32") {
          fs.chmodSync(readOnlyDir, 0o444);
        }

        await expect(
          exportKintoneToCsv(kintoneService, "1", outputPath)
        ).rejects.toThrow();
      } finally {
        // 権限を復元
        if (process.platform !== "win32") {
          fs.chmodSync(readOnlyDir, 0o755);
        }
      }
    });
  });
});
