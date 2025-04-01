import { AbstractPythonGeneratorContext } from "@fern-api/python-base";

import { PydanticModelCustomConfigSchema } from "./ModelCustomConfig";

export class PydanticModelGeneratorContext extends AbstractPythonGeneratorContext<PydanticModelCustomConfigSchema> {}
