export class ModuleSymbol {
    public readonly kind = "module";
    public readonly id: string;
    public readonly name: string;
    public readonly imports: ModuleSymbol[];
    public parent = null;
    #childrenByName: Map<string, Symbol>;

    public constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.imports = [];
        this.#childrenByName = new Map();
    }

    public addImport(moduleSymbol: ModuleSymbol) {
        this.imports.push(moduleSymbol);
    }

    public get children() {
        return Array.from(this.#childrenByName.values());
    }

    public getChildByName(name: string): Symbol | undefined {
        return this.#childrenByName.get(name);
    }

    public setChild(child: Symbol) {
        this.#childrenByName.set(child.name, child);
        child.parent = this;
    }

    public get qualifiedPath(): string[] {
        return [this.name];
    }

    public get qualifiedName(): string {
        return this.name;
    }
}

export class TypeSymbol {
    public readonly kind = "type";
    public readonly id: string;
    public readonly name: string;
    #parent: Symbol | null;
    #childrenByName: Map<string, Symbol>;

    public constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
        this.#parent = null;
        this.#childrenByName = new Map();
    }
    public get parent() {
        return this.#parent;
    }

    public set parent(parent: Symbol | null) {
        this.#parent = parent;
    }

    public get children() {
        return Array.from(this.#childrenByName.values());
    }

    public getChildByName(name: string): Symbol | undefined {
        return this.#childrenByName.get(name);
    }

    public setChild(child: Symbol) {
        this.#childrenByName.set(child.name, child);
        child.parent = this;
    }

    public get qualifiedPath(): string[] {
        const parts: string[] = [this.name];
        let cur = this.#parent;
        while (cur !== null) {
            parts.push(cur.name);
            cur = cur.parent;
        }
        return parts.reverse();
    }

    public get qualifiedName(): string {
        return this.qualifiedPath.join(".");
    }
}

export type Symbol = ModuleSymbol | TypeSymbol;
