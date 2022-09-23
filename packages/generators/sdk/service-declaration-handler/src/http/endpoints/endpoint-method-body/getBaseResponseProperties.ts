import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export function getBaseResponseProperties({ ok, file }: { ok: boolean; file: SdkFile }): ts.ObjectLiteralElementLike[] {
    return [
        createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils._Response.OK_DISCRIMINANT),
            ok ? ts.factory.createTrue() : ts.factory.createFalse()
        ),
    ];
}
