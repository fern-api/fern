import { VersionMigrations } from "../../types/VersionMigrations";
import { migration as addPathParameterOrderSetting } from "./add-path-parameter-order-setting";

export const versionMigrations: VersionMigrations = {
    version: "0.82.1",
    migrations: [addPathParameterOrderSetting]
};

export default versionMigrations;
