export class EndpointNamer {
    private count = 0;

    public getName(): string {
        const name = `_unnamedOperation${this.count}`;
        this.count += 1;
        return name;
    }
}
