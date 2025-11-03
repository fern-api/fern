import { type Generation } from "./context/generation-info";

/**
 * The portable things that a context will provide to a generator.
 *
 * This interface defines the minimal contract that any context must fulfill
 * to be compatible with generator classes that extend `WithGeneration`.
 */
export interface IGeneration {
    /** The generation context containing all utilities and state needed for code generation */
    generation: Generation;
}

/**
 * A trivial class of convenience properties that a generator class can inherit from to gain access to the portable context features.
 *
 * This base class provides convenient access to common generation context properties through protected getters,
 * eliminating the need to repeatedly access `this.ctx.generation.*` throughout generator implementations.
 */
export class WithGeneration {
    public constructor(private readonly ctx: IGeneration) {}

    /** Provides access to the generation context */
    protected get generation() {
        return this.ctx.generation;
    }

    /** Provides access to C# code generation utilities */
    protected get csharp() {
        return this.generation.csharp;
    }

    /** Provides access to generation settings and configuration */
    protected get settings() {
        return this.generation.settings;
    }

    /** Provides access to generation constants */
    protected get constants() {
        return this.generation.constants;
    }

    /** Provides access to namespace management utilities */
    protected get namespaces() {
        return this.generation.namespaces;
    }

    /** Provides access to naming utilities for generating consistent identifiers */
    protected get names() {
        return this.generation.names;
    }

    /** Provides access to type information and utilities */
    protected get types() {
        return this.generation.types;
    }

    /** Provides access to external type references and dependencies */
    protected get extern() {
        return this.generation.extern;
    }

    /** Provides access to the model navigation and inspection utilities */
    protected get model() {
        return this.generation.model;
    }

    /** Provides access to the type registry for looking up generated types */
    protected get registry() {
        return this.generation.registry;
    }

    /** Provides access to .NET System namespace types and utilities */
    public get System() {
        return this.extern.System;
    }

    /** Provides access to NUnit testing framework types */
    public get NUnit() {
        return this.extern.NUnit;
    }

    /** Provides access to OneOf discriminated union library types */
    public get OneOf() {
        return this.extern.OneOf;
    }

    /** Provides access to Google protocol buffer types */
    public get Google() {
        return this.extern.Google;
    }
}
