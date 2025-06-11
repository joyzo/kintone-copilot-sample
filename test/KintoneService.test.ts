import { KintoneService } from "../src/KintoneService";

describe("KintoneService", () => {
  let kintoneService: KintoneService;

  beforeEach(() => {
    kintoneService = new KintoneService({
      baseUrl: "https://test.cybozu.com",
      auth: {
        apiToken: "test-api-token",
      },
    });
  });

  describe("getRecord", () => {
    it("正常にレコードを取得できる", async () => {
      const record = await kintoneService.getRecord("1", "1");

      expect(record).toEqual({
        $id: { type: "NUMBER", value: "1" },
        $revision: { type: "REVISION", value: "1" },
        title: { type: "SINGLE_LINE_TEXT", value: "サンプルタイトル" },
        description: { type: "MULTI_LINE_TEXT", value: "サンプルの説明" },
      });
    });

    it("存在しないレコードの場合はエラーが発生する", async () => {
      await expect(kintoneService.getRecord("1", "999")).rejects.toThrow();
    });
  });

  describe("createRecord", () => {
    it("正常にレコードを作成できる", async () => {
      const record = {
        title: { value: "新規タイトル" },
        description: { value: "新規説明" },
      };

      const result = await kintoneService.createRecord("1", record);

      expect(result).toEqual({
        id: "123",
        revision: "1",
      });
    });

    it("存在しないアプリの場合はエラーが発生する", async () => {
      const record = {
        title: { value: "新規タイトル" },
      };

      await expect(
        kintoneService.createRecord("999", record)
      ).rejects.toThrow();
    });
  });

  describe("updateRecord", () => {
    it("正常にレコードを更新できる", async () => {
      const record = {
        title: { value: "更新されたタイトル" },
      };

      const result = await kintoneService.updateRecord("1", "1", record);

      expect(result).toEqual({
        revision: "2",
      });
    });

    it("存在しないレコードの場合はエラーが発生する", async () => {
      const record = {
        title: { value: "更新されたタイトル" },
      };

      await expect(
        kintoneService.updateRecord("1", "999", record)
      ).rejects.toThrow();
    });
  });

  describe("deleteRecord", () => {
    it("正常にレコードを削除できる", async () => {
      await expect(
        kintoneService.deleteRecord("1", "1")
      ).resolves.toBeUndefined();
    });

    it("存在しないレコードの場合はエラーが発生する", async () => {
      await expect(kintoneService.deleteRecord("1", "999")).rejects.toThrow();
    });
  });

  describe("getRecords", () => {
    it("正常にレコード一覧を取得できる", async () => {
      const result = await kintoneService.getRecords("1");

      expect(result.records).toHaveLength(2);
      expect(result.totalCount).toBe("2");

      // 基本フィールドのみをテスト（モックデータに追加フィールドが含まれるため）
      expect(result.records[0].$id).toEqual({ type: "NUMBER", value: "1" });
      expect(result.records[0].title).toEqual({
        type: "SINGLE_LINE_TEXT",
        value: "サンプルタイトル1",
      });
      expect(result.records[0].description).toEqual({
        type: "MULTI_LINE_TEXT",
        value: "サンプルの説明1",
      });

      expect(result.records[1].$id).toEqual({ type: "NUMBER", value: "2" });
      expect(result.records[1].title).toEqual({
        type: "SINGLE_LINE_TEXT",
        value: "サンプルタイトル2",
      });
      expect(result.records[1].description).toEqual({
        type: "MULTI_LINE_TEXT",
        value: "サンプルの説明2",
      });
    });

    it("クエリ条件を指定してレコードを取得できる", async () => {
      const result = await kintoneService.getRecords("1", 'title = "サンプル"');

      expect(result.records).toHaveLength(2);
    });

    it("存在しないアプリの場合はエラーが発生する", async () => {
      await expect(kintoneService.getRecords("999")).rejects.toThrow();
    });
  });
});
