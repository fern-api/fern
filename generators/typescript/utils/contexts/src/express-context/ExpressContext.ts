import { BaseContext } from "../base-context/index.js";
import { ExpressEndpointTypeSchemasContext } from "./express-endpoint-type-schemas/index.js";
import { ExpressErrorContext } from "./express-error/index.js";
import { ExpressErrorSchemaContext } from "./express-error-schema/index.js";
import { ExpressInlinedRequestBodyContext } from "./express-inlined-request-body/index.js";
import { ExpressInlinedRequestBodySchemaContext } from "./express-inlined-request-body-schema/index.js";
import { ExpressRegisterContext } from "./express-register/index.js";
import { ExpressServiceContext } from "./express-service/index.js";
import { GenericAPIExpressErrorContext } from "./generic-api-express-error/index.js";

export interface ExpressContext extends BaseContext {
    expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContext;
    expressError: ExpressErrorContext;
    expressErrorSchema: ExpressErrorSchemaContext;
    expressInlinedRequestBody: ExpressInlinedRequestBodyContext;
    expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContext;
    expressRegister: ExpressRegisterContext;
    expressService: ExpressServiceContext;
    genericAPIExpressError: GenericAPIExpressErrorContext;
}
