import { ServiceTypesConstants } from "../../constants";

export type ServiceTypeName =
    | typeof ServiceTypesConstants.Commons.Request.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME
    | typeof ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME;
