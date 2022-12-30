import { IrVersions } from "../../ir-versions";

export function convertService(
    server: IrVersions.V5.services.http.HttpService
): IrVersions.V4.services.http.HttpService {}
