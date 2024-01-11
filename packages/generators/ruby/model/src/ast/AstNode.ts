export enum NewLinePlacement{
    BEFORE, AFTER, NONE
}

export abstract class AstNode {
    // We could also track line length, but we'd likely be better off running Rubocop to format the code after it's written
    public tabSizeSpaces = 2;
    public documentation: string | undefined;

    constructor(documentation?: string) {
        this.documentation = documentation;
    }

    public abstract writeInternal(startingTabSpaces: number): string;

    protected writePaddedString(startingTabSpaces: number, content: string, withNewline: NewLinePlacement = NewLinePlacement.NONE): string {
        const s = `${" ".repeat(startingTabSpaces)}${content}`;
        switch (withNewline) {
            case NewLinePlacement.BEFORE:
                return "\n" + s;
            case NewLinePlacement.AFTER:
                return s + "\n";
            default:
                return s;
        }
    }

    public write(startingTabSpaces = 0): string {
        return this.writeInternal(startingTabSpaces);
    }
}