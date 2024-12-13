import { BaseContext } from "../base-context";
import { ExpressEndpointTypeSchemasContext } from "./express-endpoint-type-schemas";
import { ExpressErrorContext } from "./express-error";
import { ExpressErrorSchemaContext } from "./express-error-schema";
import { ExpressInlinedRequestBodyContext } from "./express-inlined-request-body";
import { ExpressInlinedRequestBodySchemaContext } from "./express-inlined-request-body-schema";
import { ExpressRegisterContext } from "./express-register";
import { ExpressServiceContext } from "./express-service";
import { GenericAPIExpressErrorContext } from "./generic-api-express-error";

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
