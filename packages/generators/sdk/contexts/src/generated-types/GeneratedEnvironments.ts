import { EnvironmentsContext } from "../contexts";
import { GeneratedFile } from "./BaseGenerated";

export interface GeneratedEnvironments extends GeneratedFile<EnvironmentsContext> {
    defaultEnvironmentEnumMemberName: string | undefined;
}
