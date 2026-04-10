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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqwithheaders = exports.noreqbody = exports.noauth = exports.inlinedrequests = exports.endpointsUrLs = exports.endpointsUnion = exports.endpointsPut = exports.endpointsPrimitive = exports.endpointsParams = exports.endpointsPagination = exports.endpointsObject = exports.endpointsHttpMethods = exports.endpointsEnum = exports.endpointsContentType = exports.endpointsContainer = void 0;
exports.endpointsContainer = __importStar(require("./endpointsContainer/index.js"));
exports.endpointsContentType = __importStar(require("./endpointsContentType/index.js"));
exports.endpointsEnum = __importStar(require("./endpointsEnum/index.js"));
__exportStar(require("./endpointsHttpMethods/client/requests/index.js"), exports);
exports.endpointsHttpMethods = __importStar(require("./endpointsHttpMethods/index.js"));
__exportStar(require("./endpointsObject/client/requests/index.js"), exports);
exports.endpointsObject = __importStar(require("./endpointsObject/index.js"));
__exportStar(require("./endpointsPagination/client/requests/index.js"), exports);
exports.endpointsPagination = __importStar(require("./endpointsPagination/index.js"));
__exportStar(require("./endpointsParams/client/requests/index.js"), exports);
exports.endpointsParams = __importStar(require("./endpointsParams/index.js"));
exports.endpointsPrimitive = __importStar(require("./endpointsPrimitive/index.js"));
__exportStar(require("./endpointsPut/client/requests/index.js"), exports);
exports.endpointsPut = __importStar(require("./endpointsPut/index.js"));
exports.endpointsUnion = __importStar(require("./endpointsUnion/index.js"));
exports.endpointsUrLs = __importStar(require("./endpointsUrLs/index.js"));
__exportStar(require("./inlinedrequests/client/requests/index.js"), exports);
exports.inlinedrequests = __importStar(require("./inlinedrequests/index.js"));
exports.noauth = __importStar(require("./noauth/index.js"));
exports.noreqbody = __importStar(require("./noreqbody/index.js"));
__exportStar(require("./reqwithheaders/client/requests/index.js"), exports);
exports.reqwithheaders = __importStar(require("./reqwithheaders/index.js"));
