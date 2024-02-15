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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sysprop = exports.homepage = exports.v2 = exports.submission = exports.problem = exports.playlist = exports.migration = exports.langServer = exports.commons = exports.admin = void 0;
exports.admin = __importStar(require("./admin"));
__exportStar(require("./admin/types"), exports);
exports.commons = __importStar(require("./commons"));
__exportStar(require("./commons/types"), exports);
exports.langServer = __importStar(require("./langServer"));
__exportStar(require("./langServer/types"), exports);
exports.migration = __importStar(require("./migration"));
__exportStar(require("./migration/types"), exports);
exports.playlist = __importStar(require("./playlist"));
__exportStar(require("./playlist/types"), exports);
exports.problem = __importStar(require("./problem"));
__exportStar(require("./problem/types"), exports);
exports.submission = __importStar(require("./submission"));
__exportStar(require("./submission/types"), exports);
exports.v2 = __importStar(require("./v2"));
__exportStar(require("./admin/service/requests"), exports);
__exportStar(require("./problem/service/requests"), exports);
exports.homepage = __importStar(require("./homepage"));
exports.sysprop = __importStar(require("./sysprop"));
