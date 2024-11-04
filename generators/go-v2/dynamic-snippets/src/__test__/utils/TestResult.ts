export class TestResult {
    public snippets: string[] = [];

    public addSnippet(snippet: string): void {
        this.snippets.push(snippet);
    }

    public toString(): string {
        if (this.snippets.length === 0) {
            return "<none>";
        }
        let s = "";
        this.snippets.forEach((snippet, idx) => {
            if (idx > 0) {
                s += "\n------------------------\n\n";
            }
            s += snippet;
        });
        return s;
    }
}
