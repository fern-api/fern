import dedent from 'dedent'
import { mkdir, writeFile } from 'fs/promises'

import { AbstractProject } from '@fern-api/base-generator'
import { AbsoluteFilePath, RelativeFilePath, join } from '@fern-api/fs-utils'
import { AbstractRubyGeneratorContext, BaseRubyCustomConfigSchema, RubyFile } from '@fern-api/ruby-ast'

const GEMFILE_FILENAME = 'Gemfile'
const RAKEFILE_FILENAME = 'Rakefile'

/**
 * In memory representation of a Ruby project.
 */
export class RubyProject extends AbstractProject<AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>> {
    public constructor({ context }: { context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema> }) {
        super(context)
    }

    public async persist(): Promise<void> {
        await this.createGemfile()
        await this.createRakefile()
        await this.writeRawFiles()
    }

    private async createGemfile(): Promise<void> {
        const gemfile = new Gemfile({ context: this.context })
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(GEMFILE_FILENAME)),
            await gemfile.toString()
        )
    }

    private async createRakefile(): Promise<void> {
        const rakefile = new Rakefile({ context: this.context })
        await writeFile(
            join(this.absolutePathToOutputDirectory, RelativeFilePath.of(RAKEFILE_FILENAME)),
            await rakefile.toString()
        )
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`)
        await mkdir(absolutePathToDirectory, { recursive: true })
    }
}

declare namespace Gemfile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>
    }
}

class Gemfile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>

    public constructor({ context }: Gemfile.Args) {
        this.context = context
    }

    public async toString(): Promise<string> {
        return dedent`
            source 'https://rubygems.org'
            gem 'rake'
        `
    }
}

declare namespace Rakefile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>
    }
}

class Rakefile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>

    public constructor({ context }: Rakefile.Args) {
        this.context = context
    }

    public async toString(): Promise<string> {
        return dedent`
            task :test do
              puts "No tests for now"
            end
        `
    }
}
