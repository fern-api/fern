import { assertNonNull } from "@fern-api/core-utils";

abstract class AbstractSymbol {
    public abstract readonly id: string;
    public abstract readonly name: string;
    protected abstract childrenByName: Map<string, Symbol>;

    public get children() {
        return Array.from(this.childrenByName.values());
    }

    public addChild(child: Symbol) {
        if (this.childrenByName.has(child.name)) {
            throw new Error(`A child with the name '${child.name}' already exists in module '${this.name}'.`);
        }
        this.childrenByName.set(child.name, child);
    }

    public getChildByName(name: string): Symbol | undefined {
        return this.childrenByName.get(name);
    }
}

export class ModuleSymbol extends AbstractSymbol {
    public readonly kind = "module";
    public readonly id: string;
    public readonly name: string;
    public readonly imports: ModuleSymbol[];
    public parent = null;
    protected childrenByName: Map<string, Symbol>;

    public constructor(id: string, name: string) {
        super();
        this.id = id;
        this.name = name;
        this.imports = [];
        this.childrenByName = new Map();
    }

    public addImport(moduleSymbol: ModuleSymbol) {
        this.imports.push(moduleSymbol);
    }

    public get qualifiedPath(): string[] {
        return [this.name];
    }

    public get qualifiedName(): string {
        return this.name;
    }
}

export class TypeSymbol extends AbstractSymbol {
    public readonly kind = "type";
    public readonly id: string;
    public readonly name: string;
    #parent: Symbol | null;
    protected childrenByName: Map<string, Symbol>;

    public constructor(name: string, id: string) {
        super();
        this.name = name;
        this.id = id;
        this.#parent = null;
        this.childrenByName = new Map();
    }

    public get parent() {
        return this.#parent;
    }

    public set parent(parent: Symbol | null) {
        this.#parent = parent;
    }

    public getNearestModuleAncestorOrThrow(): ModuleSymbol {
        let cur: Symbol | null = this.parent;
        while (cur !== null && cur.kind !== "module") {
            cur = cur.parent;
        }
        assertNonNull(cur, `No module ancestor found for type symbol '${this.id}'`);
        return cur;
    }

    public get qualifiedPath(): string[] {
        return [...(this.parent?.qualifiedPath ?? []), this.name];
    }

    public get qualifiedName(): string {
        return this.qualifiedPath.join(".");
    }
}

export type Symbol = ModuleSymbol | TypeSymbol;
