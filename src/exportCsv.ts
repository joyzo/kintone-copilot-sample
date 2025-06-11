import * as fs from "fs";
import * as path from "path";
import { KintoneService, KintoneRecord } from "./KintoneService";

export interface CsvExportOptions {
  /** 出力ファイルパス */
  outputPath: string;
  /** 含めるフィールド（指定しない場合は全フィールド） */
  fields?: string[];
  /** CSVヘッダーを含めるかどうか */
  includeHeader?: boolean;
  /** フィールドラベルをヘッダーに使用するかどうか */
  useFieldLabels?: boolean;
  /** 区切り文字（デフォルト: カンマ） */
  delimiter?: string;
  /** 文字エンコーディング（デフォルト: utf8） */
  encoding?: BufferEncoding;
}

export interface FieldInfo {
  code: string;
  label: string;
  type: string;
}

export class CsvExporter {
  private kintoneService: KintoneService;

  constructor(kintoneService: KintoneService) {
    this.kintoneService = kintoneService;
  }

  /**
   * Kintoneアプリからレコードを取得してCSVファイルにエクスポートする
   */
  async exportToCsv(
    app: string | number,
    options: CsvExportOptions,
    query?: string
  ): Promise<void> {
    try {
      console.log(`アプリ ${app} からデータを取得中...`);

      // レコードを取得
      const result = await this.kintoneService.getRecords(
        app,
        query,
        options.fields,
        true
      );

      console.log(`${result.records.length} 件のレコードを取得しました`);

      // CSVデータを生成
      const csvData = this.generateCsvData(result.records, options);

      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(options.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // CSVファイルに書き込み
      fs.writeFileSync(options.outputPath, csvData, {
        encoding: options.encoding || "utf8",
      });

      console.log(`CSVファイルを出力しました: ${options.outputPath}`);
    } catch (error) {
      console.error("CSVエクスポート中にエラーが発生しました:", error);
      throw error;
    }
  }

  /**
   * レコードデータからCSV文字列を生成する
   */
  private generateCsvData(
    records: KintoneRecord[],
    options: CsvExportOptions
  ): string {
    if (records.length === 0) {
      return "";
    }

    const delimiter = options.delimiter || ",";
    const includeHeader = options.includeHeader !== false; // デフォルトはtrue
    const csvLines: string[] = [];

    // フィールドリストを決定
    const fieldCodes = options.fields || this.extractFieldCodes(records[0]);

    // ヘッダー行を追加
    if (includeHeader) {
      const headers = fieldCodes.map((code) => {
        // フィールドラベルを使用する場合の処理（今回は簡単のためコードをそのまま使用）
        return this.escapeCsvValue(code, delimiter);
      });
      csvLines.push(headers.join(delimiter));
    }

    // データ行を追加
    records.forEach((record) => {
      const values = fieldCodes.map((fieldCode) => {
        const fieldValue = record[fieldCode];
        return this.formatFieldValue(fieldValue, delimiter);
      });
      csvLines.push(values.join(delimiter));
    });

    return csvLines.join("\n");
  }

  /**
   * レコードからフィールドコードを抽出する
   */
  private extractFieldCodes(record: KintoneRecord): string[] {
    return Object.keys(record).filter((key) => {
      // システムフィールドを除外（必要に応じて調整）
      const excludeFields = ["$id", "$revision"];
      return !excludeFields.includes(key);
    });
  }

  /**
   * フィールド値をCSV用にフォーマットする
   */
  private formatFieldValue(fieldValue: any, delimiter: string): string {
    if (fieldValue === null || fieldValue === undefined) {
      return "";
    }

    // Kintoneのフィールド値は通常オブジェクト形式
    let value: string;

    if (typeof fieldValue === "object" && fieldValue.value !== undefined) {
      // 通常のKintoneフィールド値
      if (Array.isArray(fieldValue.value)) {
        // 複数選択フィールドなど
        value = fieldValue.value.join(";");
      } else if (typeof fieldValue.value === "object") {
        // ファイルフィールドやユーザー選択フィールドなど
        value = JSON.stringify(fieldValue.value);
      } else {
        value = String(fieldValue.value);
      }
    } else if (typeof fieldValue === "object") {
      // オブジェクトの場合はJSON文字列に変換
      value = JSON.stringify(fieldValue);
    } else {
      value = String(fieldValue);
    }

    return this.escapeCsvValue(value, delimiter);
  }

  /**
   * CSV用に値をエスケープする
   */
  private escapeCsvValue(value: string, delimiter: string): string {
    // ダブルクォートを2つにする
    value = value.replace(/"/g, '""');

    // 改行、カンマ、ダブルクォートが含まれる場合は全体をダブルクォートで囲む
    if (
      value.includes("\n") ||
      value.includes("\r") ||
      value.includes(delimiter) ||
      value.includes('"')
    ) {
      value = `"${value}"`;
    }

    return value;
  }

  /**
   * 複数のアプリから一括でCSVエクスポート
   */
  async exportMultipleApps(
    apps: Array<{
      app: string | number;
      query?: string;
      outputPath: string;
    }>,
    commonOptions: Omit<CsvExportOptions, "outputPath">
  ): Promise<void> {
    for (const appConfig of apps) {
      await this.exportToCsv(
        appConfig.app,
        {
          ...commonOptions,
          outputPath: appConfig.outputPath,
        },
        appConfig.query
      );
    }
  }
}

/**
 * 便利関数：KintoneServiceを使って簡単にCSVエクスポート
 */
export async function exportKintoneToCsv(
  kintoneService: KintoneService,
  app: string | number,
  outputPath: string,
  options?: Partial<CsvExportOptions>,
  query?: string
): Promise<void> {
  const exporter = new CsvExporter(kintoneService);
  await exporter.exportToCsv(
    app,
    {
      outputPath,
      ...options,
    },
    query
  );
}
