import { KintoneRestAPIClient } from "@kintone/rest-api-client";

export interface KintoneConfig {
  baseUrl: string;
  auth: {
    username?: string;
    password?: string;
    apiToken?: string;
  };
}

export interface KintoneRecord {
  [key: string]: any;
}

export interface KintoneApp {
  app: string | number;
}

export class KintoneService {
  private client: KintoneRestAPIClient;

  constructor(config: KintoneConfig) {
    this.client = new KintoneRestAPIClient({
      baseUrl: config.baseUrl,
      auth: config.auth,
    });
  }

  /**
   * レコードを取得する
   */
  async getRecord(
    app: string | number,
    id: string | number
  ): Promise<KintoneRecord> {
    const response = await this.client.record.getRecord({
      app,
      id,
    });
    return response.record;
  }

  /**
   * レコードを作成する
   */
  async createRecord(
    app: string | number,
    record: KintoneRecord
  ): Promise<{ id: string; revision: string }> {
    const response = await this.client.record.addRecord({
      app,
      record,
    });
    return {
      id: response.id,
      revision: response.revision,
    };
  }

  /**
   * レコードを更新する
   */
  async updateRecord(
    app: string | number,
    id: string | number,
    record: KintoneRecord,
    revision?: string
  ): Promise<{ revision: string }> {
    const response = await this.client.record.updateRecord({
      app,
      id,
      record,
      revision,
    });
    return {
      revision: response.revision,
    };
  }

  /**
   * レコードを削除する
   */
  async deleteRecord(
    app: string | number,
    id: string | number,
    revision?: string
  ): Promise<void> {
    await this.client.record.deleteRecords({
      app,
      ids: [id],
      revisions: revision ? [revision] : undefined,
    });
  }

  /**
   * レコードを検索する
   */
  async getRecords(
    app: string | number,
    query?: string,
    fields?: string[],
    totalCount?: boolean
  ): Promise<{
    records: KintoneRecord[];
    totalCount?: string;
  }> {
    const response = await this.client.record.getRecords({
      app,
      query,
      fields,
      totalCount,
    });
    return {
      records: response.records,
      totalCount: response.totalCount || undefined,
    };
  }
}
