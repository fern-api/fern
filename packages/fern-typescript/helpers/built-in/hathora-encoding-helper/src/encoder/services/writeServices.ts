import { Services } from "@fern-api/api";
import { FernWriters, TypeResolver } from "@fern-typescript/commons";
import { tsMorph } from "@fern-typescript/helper-utils";
import { writeHttpService } from "./writeHttpService";

export function writeServices({
    services,
    typeResolver,
    file,
    modelDirectory,
}: {
    services: Services;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });
    for (const service of services.http) {
        writer.addProperty({
            key: service.name.name,
            value: writeHttpService({ service, typeResolver, file, modelDirectory }),
        });
    }
    return writer.toFunction();
}
