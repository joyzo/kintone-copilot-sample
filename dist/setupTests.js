"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const server_1 = require("./mocks/server");
// テスト開始前にサーバーを起動
(0, globals_1.beforeAll)(() => server_1.server.listen());
// 各テスト後にハンドラーをリセット
(0, globals_1.afterEach)(() => server_1.server.resetHandlers());
// すべてのテスト終了後にサーバーを停止
(0, globals_1.afterAll)(() => server_1.server.close());
//# sourceMappingURL=setupTests.js.map