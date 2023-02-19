import { ROOT_PATH } from "@fern-api/routing-utils";

export const HOME = ROOT_PATH;
export const API = HOME.addParameter("API_ID");
export const API_DEFINITION = API.addPath("definition");
export const API_ENVIRONMENT = API_DEFINITION.addParameter("ENVIRONMENT_ID");
export const API_PACKAGE = API_ENVIRONMENT.addSplat();
