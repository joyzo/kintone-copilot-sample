import { beforeAll, afterEach, afterAll } from "@jest/globals";
import { server } from "./mocks/server";

// テスト開始前にサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト終了後にサーバーを停止
afterAll(() => server.close());
