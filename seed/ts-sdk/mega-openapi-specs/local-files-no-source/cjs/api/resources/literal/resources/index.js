"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.reference = exports.query = exports.path = exports.inlined = exports.headers = void 0;
__exportStar(require("./headers/client/requests/index.js"), exports);
exports.headers = __importStar(require("./headers/index.js"));
__exportStar(require("./headers/types/index.js"), exports);
__exportStar(require("./inlined/client/requests/index.js"), exports);
exports.inlined = __importStar(require("./inlined/index.js"));
__exportStar(require("./path/client/requests/index.js"), exports);
exports.path = __importStar(require("./path/index.js"));
__exportStar(require("./path/types/index.js"), exports);
__exportStar(require("./query/client/requests/index.js"), exports);
exports.query = __importStar(require("./query/index.js"));
__exportStar(require("./query/types/index.js"), exports);
__exportStar(require("./reference/client/requests/index.js"), exports);
exports.reference = __importStar(require("./reference/index.js"));
