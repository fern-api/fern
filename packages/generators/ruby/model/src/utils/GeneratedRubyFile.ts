import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratedFile } from "./GeneratedFile";

function classToRubyFilename(className: string) {
    let fileName = className[0].toLowerCase() + className.slice(1, className.length).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fileName  = fileName.replaceAll(" _","_");

    return `${fileName.replaceAll(" ","_").replace(/(^_*|_*$)/g, "")}.rb`;
}

export class GeneratedRubyFile extends GeneratedFile{
    public className: string;

    constructor(directoryPrefix: RelativeFilePath, className: string, fileContents: string, isTestFile?: boolean) {
        // Path needs lib or test, if test: test/ is relative path 
        // otherwise, relative path is: 
        // lib/client_class_name.rb or request_client.rb or environment.rb or exception.rb OR
        // /lib/client_class_name/package_name/services/service_name.rb OR /lib/client_class_name/package_name/types/type_name.rb
        const updatedPrefix = (isTestFile ?? false) ? join("test", directoryPrefix) : join("lib", directoryPrefix);
        super(classToRubyFilename(className), updatedPrefix, fileContents);

        this.className = className;
    }
}