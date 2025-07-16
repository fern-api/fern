import { Writer } from "./Writer"

export declare namespace RubyFile {
    interface Args extends Writer.Args {}
}

export class RubyFile extends Writer {
    constructor({ customConfig, formatter }: RubyFile.Args) {
        super({ customConfig, formatter })
    }

    public async toStringAsync(): Promise<string> {
        const content = this.getContent()
        if (this.formatter != null) {
            try {
                return this.formatter.format(content)
            } catch (error) {
                throw new Error(`Failed to format Ruby file: ${error}\n${content}`)
            }
        }
        return content
    }

    public toString(): string {
        const content = this.getContent()
        if (this.formatter != null) {
            try {
                return this.formatter.formatSync(content)
            } catch (error) {
                throw new Error(`Failed to format Ruby file: ${error}\n${content}`)
            }
        }
        return content
    }

    private getContent(): string {
        const requires = this.stringifyRequires()
        return requires.length > 0
            ? `${requires}

${this.buffer}`
            : this.buffer
    }

    private stringifyRequires(): string {
        return Array.from(this.requires)
            .map((requirePath) => `require "${requirePath}"`)
            .join("\n")
    }
}
