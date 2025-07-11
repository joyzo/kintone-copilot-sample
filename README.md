# Kintone REST API サンプルプロジェクト

このプロジェクトは、TypeScriptと@kintone/rest-api-clientを使用してkintone REST APIとやり取りするためのサンプル実装です。JestとMock Service Worker (MSW)を使用してユニットテストも含まれています。

## インストール

```bash
npm install
```

## 使用方法

### 基本的な使用例

```typescript
import { KintoneService } from './src/KintoneService';

const kintoneService = new KintoneService({
  baseUrl: 'https://your-domain.cybozu.com',
  auth: {
    apiToken: 'your-api-token',
    // または username/password認証
    // username: 'your-username',
    // password: 'your-password',
  },
});

// レコードを作成
const createResult = await kintoneService.createRecord('1', {
  title: { value: 'サンプルタイトル' },
  description: { value: 'サンプルの説明' },
});

// レコードを取得
const record = await kintoneService.getRecord('1', createResult.id);

// レコードを更新
const updateResult = await kintoneService.updateRecord('1', createResult.id, {
  title: { value: '更新されたタイトル' },
});

// レコード一覧を取得
const records = await kintoneService.getRecords('1');

// レコードを削除
await kintoneService.deleteRecord('1', createResult.id);
```

### CSVエクスポート機能

```typescript
import { CsvExporter, exportKintoneToCsv } from './src/exportCsv';

// 簡単な使用方法
await exportKintoneToCsv(
  kintoneService,
  1, // アプリID
  './exports/data.csv'
);

// 詳細オプション付き
await exportKintoneToCsv(
  kintoneService,
  1,
  './exports/filtered_data.csv',
  {
    fields: ['title', 'description', 'status'], // 特定フィールドのみ
    includeHeader: true,
    delimiter: ',',
    encoding: 'utf8'
  },
  'status = "完了"' // 条件指定
);

// CsvExporterクラスを直接使用
const exporter = new CsvExporter(kintoneService);

// TSVファイルとして出力
await exporter.exportToCsv(1, {
  outputPath: './exports/data.tsv',
  delimiter: '\t',
  includeHeader: true
});

// 複数アプリの一括エクスポート
await exporter.exportMultipleApps([
  { app: 1, outputPath: './exports/app1.csv' },
  { app: 2, outputPath: './exports/app2.csv' }
], {
  includeHeader: true,
  delimiter: ','
});
```

## 利用可能なメソッド

### `getRecord(app, id)`
指定されたアプリとIDのレコードを取得します。

### `createRecord(app, record)`
新しいレコードを作成します。

### `updateRecord(app, id, record, revision?)`
既存のレコードを更新します。

### `deleteRecord(app, id, revision?)`
指定されたレコードを削除します。

### `getRecords(app, query?, fields?, totalCount?)`
レコード一覧を取得します。クエリ条件を指定してフィルタリングできます。

## CSVエクスポート機能

### `exportKintoneToCsv(kintoneService, app, outputPath, options?, query?)`
Kintoneアプリからレコードを取得してCSVファイルにエクスポートします。

### `CsvExporter`クラス
より詳細な制御が必要な場合に使用するクラスです。

- `exportToCsv(app, options, query?)`: 単一アプリのCSVエクスポート
- `exportMultipleApps(apps, commonOptions)`: 複数アプリの一括エクスポート

### CSVエクスポートオプション

- `outputPath`: 出力ファイルパス（必須）
- `fields`: 含めるフィールド（省略時は全フィールド）
- `includeHeader`: ヘッダー行を含めるか（デフォルト: true）
- `delimiter`: 区切り文字（デフォルト: カンマ）
- `encoding`: 文字エンコーディング（デフォルト: utf8）

## 実行方法

### テストの実行

```bash
npm test
```

### テストをウォッチモードで実行

```bash
npm run test:watch
```

### カバレッジレポートを生成

```bash
npm run test:coverage
```

## 開発

### TypeScriptのビルド

```bash
npm run build
```

### 開発モードでの実行

```bash
npm run dev
```

## プロジェクト構造

```
├── src/
│   ├── index.ts              # メインエントリーポイント
│   ├── KintoneService.ts     # Kintone APIラッパークラス
│   ├── exportCsv.ts          # CSVエクスポート機能
│   └── csvExportExample.ts   # CSVエクスポートの使用例
├── exports/                  # CSVファイル出力先ディレクトリ
├── test/
│   ├── KintoneService.test.ts # ユニットテスト
│   ├── setupTests.ts         # テストセットアップ
│   └── mocks/
│       ├── handlers.ts       # MSWモックハンドラー
│       └── server.ts         # MSWサーバー設定
├── jest.config.js            # Jest設定
├── tsconfig.json             # TypeScript設定（本番用）
├── tsconfig.test.json        # TypeScript設定（テスト用）
└── package.json              # プロジェクト設定
```

## テスト戦略

このプロジェクトでは、テストコードを`test`ディレクトリに分離して管理しています：

- **ディレクトリ分離**: `src`ディレクトリには本番コード、`test`ディレクトリにはテストコードを配置
- **Mock Service Worker (MSW)**: HTTPリクエストをモック化し、実際のkintone APIを呼び出すことなくテスト実行
- **ユニットテスト**: 各メソッドの正常系とエラー系をテスト
- **型安全性**: TypeScriptを使用して型安全性を確保

## 依存関係

- `@kintone/rest-api-client`: Kintone REST APIクライアント
- `typescript`: TypeScript言語サポート
- `jest`: テストフレームワーク
- `ts-jest`: TypeScript用Jestプリセット
- `msw`: API モッキングライブラリ

## ライセンス

ISC
