"use strict";
/**
 * This file was auto-generated by Fern from our API Definition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedVariablesError = void 0;
class SeedVariablesError extends Error {
    constructor(errorName) {
        super();
        this.errorName = errorName;
        Object.setPrototypeOf(this, SeedVariablesError.prototype);
    }
}
exports.SeedVariablesError = SeedVariablesError;
