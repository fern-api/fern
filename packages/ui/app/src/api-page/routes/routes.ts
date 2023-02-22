import { FernRoutes } from "../../routes";

export const API_DEFINITION = FernRoutes.HOME.addParameter("API_ID");
export const API_ENVIRONMENT = API_DEFINITION.addParameter("ENVIRONMENT_ID");
export const API_PACKAGE = API_ENVIRONMENT.addSplat();
