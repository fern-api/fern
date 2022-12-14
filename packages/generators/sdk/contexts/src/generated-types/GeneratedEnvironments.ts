import { EnvironmentsContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedEnvironments extends GeneratedFile<EnvironmentsContext> {
    defaultEnvironmentEnumMemberName: string | undefined;
}
