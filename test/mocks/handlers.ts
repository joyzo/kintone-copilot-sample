import { http, HttpResponse } from "msw";

const BASE_URL = "https://test.cybozu.com";

export const handlers = [
  // レコード取得のモック
  http.get(`${BASE_URL}/k/v1/record.json`, ({ request }) => {
    const url = new URL(request.url);
    const app = url.searchParams.get("app");
    const id = url.searchParams.get("id");

    if (app === "1" && id === "1") {
      return HttpResponse.json({
        record: {
          $id: { type: "NUMBER", value: "1" },
          $revision: { type: "REVISION", value: "1" },
          title: { type: "SINGLE_LINE_TEXT", value: "サンプルタイトル" },
          description: { type: "MULTI_LINE_TEXT", value: "サンプルの説明" },
        },
      });
    }

    return HttpResponse.json(
      { code: "GAIA_RE01", message: "レコードが見つかりません。" },
      { status: 404 }
    );
  }),

  // レコード作成のモック
  http.post(`${BASE_URL}/k/v1/record.json`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.app === "1") {
      return HttpResponse.json({
        id: "123",
        revision: "1",
      });
    }

    return HttpResponse.json(
      { code: "GAIA_AP01", message: "アプリが見つかりません。" },
      { status: 404 }
    );
  }),

  // レコード更新のモック
  http.put(`${BASE_URL}/k/v1/record.json`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.app === "1" && body.id === "1") {
      return HttpResponse.json({
        revision: "2",
      });
    }

    return HttpResponse.json(
      { code: "GAIA_RE01", message: "レコードが見つかりません。" },
      { status: 404 }
    );
  }),

  // レコード削除のモック
  http.delete(`${BASE_URL}/k/v1/records.json`, ({ request }) => {
    const url = new URL(request.url);
    const app = url.searchParams.get("app");

    // ids[0], ids[1] のような形式のパラメータを取得
    const ids: string[] = [];
    let index = 0;
    while (url.searchParams.has(`ids[${index}]`)) {
      const id = url.searchParams.get(`ids[${index}]`);
      if (id) ids.push(id);
      index++;
    }

    if (app === "1" && ids.includes("1")) {
      return HttpResponse.json({});
    }

    return HttpResponse.json(
      { code: "GAIA_RE01", message: "レコードが見つかりません。" },
      { status: 404 }
    );
  }),

  // レコード一覧取得のモック
  http.get(`${BASE_URL}/k/v1/records.json`, ({ request }) => {
    const url = new URL(request.url);
    const app = url.searchParams.get("app");
    const query = url.searchParams.get("query");
    const fields = url.searchParams.getAll("fields");

    if (app === "1") {
      // 基本的なテストデータ
      let records = [
        {
          $id: { type: "NUMBER", value: "1" },
          $revision: { type: "REVISION", value: "1" },
          title: { type: "SINGLE_LINE_TEXT", value: "サンプルタイトル1" },
          description: { type: "MULTI_LINE_TEXT", value: "サンプルの説明1" },
          status: { type: "DROP_DOWN", value: "進行中" },
          created_time: { type: "CREATED_TIME", value: "2024-01-01T10:00:00Z" },
          // 特殊文字を含むテストデータ
          special_field: {
            type: "SINGLE_LINE_TEXT",
            value: '特殊文字,"テスト"\n改行',
          },
          // 配列データのテスト
          multi_select: { type: "MULTI_SELECT", value: ["選択肢1", "選択肢2"] },
          // ファイルフィールドのテスト
          file_field: {
            type: "FILE",
            value: [
              {
                contentType: "text/plain",
                fileKey: "test-file-key",
                name: "test.txt",
                size: "1024",
              },
            ],
          },
        },
        {
          $id: { type: "NUMBER", value: "2" },
          $revision: { type: "REVISION", value: "1" },
          title: { type: "SINGLE_LINE_TEXT", value: "サンプルタイトル2" },
          description: { type: "MULTI_LINE_TEXT", value: "サンプルの説明2" },
          status: { type: "DROP_DOWN", value: "完了" },
          created_time: { type: "CREATED_TIME", value: "2024-01-02T10:00:00Z" },
          special_field: { type: "SINGLE_LINE_TEXT", value: "通常のテキスト" },
          multi_select: { type: "MULTI_SELECT", value: ["選択肢3"] },
          file_field: { type: "FILE", value: [] },
        },
      ];

      // フィールド指定がある場合はフィルタリング
      if (fields.length > 0) {
        records = records.map((record) => {
          const filteredRecord: any = {};
          fields.forEach((field) => {
            if (record[field as keyof typeof record]) {
              filteredRecord[field] = record[field as keyof typeof record];
            }
          });
          return filteredRecord;
        });
      }

      // クエリによるフィルタリング（簡易実装）
      if (query) {
        if (query.includes('status = "完了"')) {
          records = records.filter(
            (record) => record.status && record.status.value === "完了"
          );
        } else if (query.includes("limit 50")) {
          records = records.slice(0, 50);
        }
      }

      return HttpResponse.json({
        records,
        totalCount: records.length.toString(),
      });
    }

    if (app === "2") {
      // 2番目のアプリ用のテストデータ
      return HttpResponse.json({
        records: [
          {
            $id: { type: "NUMBER", value: "1" },
            $revision: { type: "REVISION", value: "1" },
            name: { type: "SINGLE_LINE_TEXT", value: "アプリ2のレコード1" },
            value: { type: "NUMBER", value: "100" },
          },
        ],
        totalCount: "1",
      });
    }

    return HttpResponse.json(
      { code: "GAIA_AP01", message: "アプリが見つかりません。" },
      { status: 404 }
    );
  }),
];
