import { ROOT_PATH } from "@fern-api/routing-utils";

export const HOME = ROOT_PATH;
export const API = HOME.addParameter("API_ID");
export const API_DEFINITION = API.addPath("definition").addParameter("ENVIRONMENT");
export const API_DEFINITION_PACKAGE = API_DEFINITION.addSplat();

export const RELATIVE_ENDPOINT = ROOT_PATH.addPath("endpoint").addParameter("ENDPOINT_ID");
export const RELATIVE_TYPE = ROOT_PATH.addPath("type").addParameter("TYPE_ID");
