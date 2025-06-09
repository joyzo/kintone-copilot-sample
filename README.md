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

## テスト

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
│   └── KintoneService.ts     # Kintone APIラッパークラス
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
