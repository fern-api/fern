import { IrVersions } from "../../ir-versions";
import { convertHeader } from "./convertHeader";

export function convertAuth(auth: IrVersions.V5.auth.ApiAuth): IrVersions.V4.auth.ApiAuth {
    return {
        docs: auth.docs,
        requirement: auth.requirement,
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme))
    };
}

function convertAuthScheme(scheme: IrVersions.V5.auth.AuthScheme): IrVersions.V4.auth.AuthScheme {
    return IrVersions.V5.auth.AuthScheme._visit<IrVersions.V4.auth.AuthScheme>(scheme, {
        basic: IrVersions.V4.auth.AuthScheme.basic,
        bearer: IrVersions.V4.auth.AuthScheme.bearer,
        header: (header) => IrVersions.V4.auth.AuthScheme.header(convertHeader(header)),
        _unknown: () => {
            throw new Error("Unknown AuthScheme: " + scheme._type);
        }
    });
}
