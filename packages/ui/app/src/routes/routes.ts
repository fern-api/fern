import { ROOT_PATH } from "@fern-api/routing-utils";

export const HOME = ROOT_PATH;
export const API = HOME.addParameter("API_ID");
export const API_DEFINITION = API.addPath("definition").addParameter("ENVIRONMENT_ID");
export const API_DEFINITION_PACKAGE = API_DEFINITION.addSplat();

export const RELATIVE_ENDPOINT = ROOT_PATH.addPath("endpoints").addParameter("ENDPOINT_NAME");
export const RELATIVE_TYPE = ROOT_PATH.addPath("types").addParameter("TYPE_NAME");
