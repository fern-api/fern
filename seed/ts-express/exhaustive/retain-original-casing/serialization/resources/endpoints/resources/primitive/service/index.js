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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndReturnBase64 = exports.getAndReturnUuid = exports.getAndReturnDate = exports.getAndReturnDatetime = exports.getAndReturnBool = exports.getAndReturnDouble = exports.getAndReturnLong = exports.getAndReturnInt = exports.getAndReturnString = void 0;
exports.getAndReturnString = __importStar(require("./getAndReturnString"));
exports.getAndReturnInt = __importStar(require("./getAndReturnInt"));
exports.getAndReturnLong = __importStar(require("./getAndReturnLong"));
exports.getAndReturnDouble = __importStar(require("./getAndReturnDouble"));
exports.getAndReturnBool = __importStar(require("./getAndReturnBool"));
exports.getAndReturnDatetime = __importStar(require("./getAndReturnDatetime"));
exports.getAndReturnDate = __importStar(require("./getAndReturnDate"));
exports.getAndReturnUuid = __importStar(require("./getAndReturnUuid"));
exports.getAndReturnBase64 = __importStar(require("./getAndReturnBase64"));
