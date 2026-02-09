import { VersionMigrations } from "../../types/VersionMigrations.js";
import addPathParameterOrderSetting from "./add-path-parameter-order-setting/index.js";

export const versionMigrations: VersionMigrations = {
    version: "0.82.1",
    migrations: [addPathParameterOrderSetting]
};

export default versionMigrations;
