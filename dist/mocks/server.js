"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const node_1 = require("msw/node");
const handlers_1 = require("./handlers");
// テスト用のMSWサーバーを設定
exports.server = (0, node_1.setupServer)(...handlers_1.handlers);
//# sourceMappingURL=server.js.map