import dedent from "dedent";
import { mkdir, writeFile, readFile } from "fs/promises";
import { join as pathJoin } from "path";
import { template } from "lodash-es";

import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { AbstractRubyGeneratorContext, BaseRubyCustomConfigSchema, RubyFile } from "@fern-api/ruby-ast";

const GEMFILE_FILENAME = "Gemfile";
const RAKEFILE_FILENAME = "Rakefile";

/**
 * In memory representation of a Ruby project.
 */
export class RubyProject extends AbstractProject<AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>> {
    private coreFiles: File[] = [];

    public constructor({ context }: { context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema> }) {
        super(context);
    }

    public async persist(): Promise<void> {
        await this.createGemfile();
        await this.createRakefile();
        await this.writeRawFiles();
        await this.createAsIsFiles();
        await this.writeAsIsFiles();
    }

    private async createGemfile(): Promise<void> {
        const gemfile = new Gemfile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(GEMFILE_FILENAME)),
            await gemfile.toString()
        );
    }

    private async createRakefile(): Promise<void> {
        const rakefile = new Rakefile({ context: this.context });
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(RAKEFILE_FILENAME)),
            await rakefile.toString()
        );
    }

    private async createAsIsFiles(): Promise<void> {
        // Check if context has getCoreAsIsFiles method
        if (typeof (this.context as any).getCoreAsIsFiles === 'function') {
            const asIsFiles = (this.context as any).getCoreAsIsFiles();
            this.context.logger.debug(`Found ${asIsFiles.length} as-is files to copy: ${asIsFiles.join(', ')}`);
            
            for (const filename of asIsFiles) {
                this.coreFiles.push(await this.createAsIsFile({ filename }));
            }
        } else {
            this.context.logger.debug('Context does not have getCoreAsIsFiles method');
        }
    }

    private async createAsIsFile({ filename }: { filename: string }): Promise<File> {
        let contents: string;
        
        // Read template from file (asIs directory is copied to lib during build)
        if (filename === "model/field.Template.rb") {
            const templatePath = pathJoin(__dirname, "asIs", filename);
            contents = await readFile(templatePath, "utf-8");
        } else {
            throw new Error(`Unknown as-is file: ${filename}`);
        }
        
        return new File(
            filename.replace(".Template", ""),
            RelativeFilePath.of("lib/internal/types"),
            replaceTemplate({
                contents,
                variables: getTemplateVariables({
                    gemNamespace: this.context.config.organization || 'fern'
                })
            })
        );
    }

    private async writeAsIsFiles(): Promise<void> {
        for (const file of this.coreFiles) {
            await file.write(this.absolutePathToOutputDirectory);
        }
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}

function replaceTemplate({ contents, variables }: { contents: string; variables: Record<string, unknown> }): string {
    return template(contents)(variables);
}

function getTemplateVariables({ gemNamespace }: { gemNamespace: string }): Record<string, unknown> {
    return {
        gem_namespace: gemNamespace
    };
}

declare namespace Gemfile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    }
}

class Gemfile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context }: Gemfile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        return dedent`
            source 'https://rubygems.org'
            gem 'rake'
        `;
    }
}

declare namespace Rakefile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    }
}

class Rakefile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    public constructor({ context }: Rakefile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        return dedent`
            task :test do
              puts "No tests for now"
            end
        `;
    }
}
