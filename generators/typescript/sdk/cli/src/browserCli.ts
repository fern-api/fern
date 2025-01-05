import { JavaScriptRuntime } from "@fern-typescript/commons";

import { SdkGeneratorCli } from "./SdkGeneratorCli";

void new SdkGeneratorCli({ targetRuntime: JavaScriptRuntime.BROWSER }).runCli();
