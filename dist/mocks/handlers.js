"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const msw_1 = require("msw");
const BASE_URL = 'https://test.cybozu.com';
exports.handlers = [
    // レコード取得のモック
    msw_1.http.get(`${BASE_URL}/k/v1/record.json`, ({ request }) => {
        const url = new URL(request.url);
        const app = url.searchParams.get('app');
        const id = url.searchParams.get('id');
        if (app === '1' && id === '1') {
            return msw_1.HttpResponse.json({
                record: {
                    $id: { type: 'NUMBER', value: '1' },
                    $revision: { type: 'REVISION', value: '1' },
                    title: { type: 'SINGLE_LINE_TEXT', value: 'サンプルタイトル' },
                    description: { type: 'MULTI_LINE_TEXT', value: 'サンプルの説明' },
                },
            });
        }
        return msw_1.HttpResponse.json({ code: 'GAIA_RE01', message: 'レコードが見つかりません。' }, { status: 404 });
    }),
    // レコード作成のモック
    msw_1.http.post(`${BASE_URL}/k/v1/record.json`, async ({ request }) => {
        const body = await request.json();
        if (body.app === '1') {
            return msw_1.HttpResponse.json({
                id: '123',
                revision: '1',
            });
        }
        return msw_1.HttpResponse.json({ code: 'GAIA_AP01', message: 'アプリが見つかりません。' }, { status: 404 });
    }),
    // レコード更新のモック
    msw_1.http.put(`${BASE_URL}/k/v1/record.json`, async ({ request }) => {
        const body = await request.json();
        if (body.app === '1' && body.id === '1') {
            return msw_1.HttpResponse.json({
                revision: '2',
            });
        }
        return msw_1.HttpResponse.json({ code: 'GAIA_RE01', message: 'レコードが見つかりません。' }, { status: 404 });
    }),
    // レコード削除のモック
    msw_1.http.delete(`${BASE_URL}/k/v1/records.json`, ({ request }) => {
        const url = new URL(request.url);
        const app = url.searchParams.get('app');
        // ids[0], ids[1] のような形式のパラメータを取得
        const ids = [];
        let index = 0;
        while (url.searchParams.has(`ids[${index}]`)) {
            const id = url.searchParams.get(`ids[${index}]`);
            if (id)
                ids.push(id);
            index++;
        }
        if (app === '1' && ids.includes('1')) {
            return msw_1.HttpResponse.json({});
        }
        return msw_1.HttpResponse.json({ code: 'GAIA_RE01', message: 'レコードが見つかりません。' }, { status: 404 });
    }),
    // レコード一覧取得のモック
    msw_1.http.get(`${BASE_URL}/k/v1/records.json`, ({ request }) => {
        const url = new URL(request.url);
        const app = url.searchParams.get('app');
        if (app === '1') {
            return msw_1.HttpResponse.json({
                records: [
                    {
                        $id: { type: 'NUMBER', value: '1' },
                        $revision: { type: 'REVISION', value: '1' },
                        title: { type: 'SINGLE_LINE_TEXT', value: 'サンプルタイトル1' },
                        description: { type: 'MULTI_LINE_TEXT', value: 'サンプルの説明1' },
                    },
                    {
                        $id: { type: 'NUMBER', value: '2' },
                        $revision: { type: 'REVISION', value: '1' },
                        title: { type: 'SINGLE_LINE_TEXT', value: 'サンプルタイトル2' },
                        description: { type: 'MULTI_LINE_TEXT', value: 'サンプルの説明2' },
                    },
                ],
                totalCount: '2',
            });
        }
        return msw_1.HttpResponse.json({ code: 'GAIA_AP01', message: 'アプリが見つかりません。' }, { status: 404 });
    }),
];
//# sourceMappingURL=handlers.js.map