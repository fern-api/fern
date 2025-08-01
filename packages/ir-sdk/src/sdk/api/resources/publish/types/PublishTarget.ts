/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernIr from "../../../index";

export type PublishTarget =
    | FernIr.PublishTarget.Postman
    | FernIr.PublishTarget.Npm
    | FernIr.PublishTarget.Maven
    | FernIr.PublishTarget.Pypi;

export namespace PublishTarget {
    export interface Postman extends FernIr.PostmanPublishTarget, _Utils {
        type: "postman";
    }

    export interface Npm extends FernIr.NpmPublishTarget, _Utils {
        type: "npm";
    }

    export interface Maven extends FernIr.MavenPublishTarget, _Utils {
        type: "maven";
    }

    export interface Pypi extends FernIr.PypiPublishTarget, _Utils {
        type: "pypi";
    }

    export interface _Utils {
        _visit: <_Result>(visitor: FernIr.PublishTarget._Visitor<_Result>) => _Result;
    }

    export interface _Visitor<_Result> {
        postman: (value: FernIr.PostmanPublishTarget) => _Result;
        npm: (value: FernIr.NpmPublishTarget) => _Result;
        maven: (value: FernIr.MavenPublishTarget) => _Result;
        pypi: (value: FernIr.PypiPublishTarget) => _Result;
        _other: (value: { type: string }) => _Result;
    }
}

export const PublishTarget = {
    postman: (value: FernIr.PostmanPublishTarget): FernIr.PublishTarget.Postman => {
        return {
            ...value,
            type: "postman",
            _visit: function <_Result>(
                this: FernIr.PublishTarget.Postman,
                visitor: FernIr.PublishTarget._Visitor<_Result>,
            ) {
                return FernIr.PublishTarget._visit(this, visitor);
            },
        };
    },

    npm: (value: FernIr.NpmPublishTarget): FernIr.PublishTarget.Npm => {
        return {
            ...value,
            type: "npm",
            _visit: function <_Result>(
                this: FernIr.PublishTarget.Npm,
                visitor: FernIr.PublishTarget._Visitor<_Result>,
            ) {
                return FernIr.PublishTarget._visit(this, visitor);
            },
        };
    },

    maven: (value: FernIr.MavenPublishTarget): FernIr.PublishTarget.Maven => {
        return {
            ...value,
            type: "maven",
            _visit: function <_Result>(
                this: FernIr.PublishTarget.Maven,
                visitor: FernIr.PublishTarget._Visitor<_Result>,
            ) {
                return FernIr.PublishTarget._visit(this, visitor);
            },
        };
    },

    pypi: (value: FernIr.PypiPublishTarget): FernIr.PublishTarget.Pypi => {
        return {
            ...value,
            type: "pypi",
            _visit: function <_Result>(
                this: FernIr.PublishTarget.Pypi,
                visitor: FernIr.PublishTarget._Visitor<_Result>,
            ) {
                return FernIr.PublishTarget._visit(this, visitor);
            },
        };
    },

    _visit: <_Result>(value: FernIr.PublishTarget, visitor: FernIr.PublishTarget._Visitor<_Result>): _Result => {
        switch (value.type) {
            case "postman":
                return visitor.postman(value);
            case "npm":
                return visitor.npm(value);
            case "maven":
                return visitor.maven(value);
            case "pypi":
                return visitor.pypi(value);
            default:
                return visitor._other(value as any);
        }
    },
} as const;
