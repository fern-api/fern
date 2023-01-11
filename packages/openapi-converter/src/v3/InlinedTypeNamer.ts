
export class InlinedTypeNamer {

    private count = 0;

    public getName(): string {
        const name = `_InlinedType${this.count}`;
        this.count += 1;
        return name;
    }
}