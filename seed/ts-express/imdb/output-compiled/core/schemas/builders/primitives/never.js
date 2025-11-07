"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.never = void 0;
const Schema_js_1 = require("../../Schema.js");
const createIdentitySchemaCreator_js_1 = require("../../utils/createIdentitySchemaCreator.js");
exports.never = (0, createIdentitySchemaCreator_js_1.createIdentitySchemaCreator)(Schema_js_1.SchemaType.NEVER, (_value, { breadcrumbsPrefix = [] } = {}) => ({
    ok: false,
    errors: [
        {
            path: breadcrumbsPrefix,
            message: "Expected never",
        },
    ],
}));
