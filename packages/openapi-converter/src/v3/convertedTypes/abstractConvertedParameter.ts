export abstract class AbstractConvertedParameter {
    public readonly type: string;
    public readonly docs: string | undefined;

    constructor({ type, docs }: { type: string; docs: string | undefined }) {
        this.type = type;
        this.docs = docs;
    }
}
