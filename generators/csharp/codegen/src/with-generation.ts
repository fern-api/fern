import { type Generation } from "./context/generation-info";

/**
 * A trivial class of convenience properties that a generator class can inherit from to gain access to the portable context features.
 *
 * This base class provides convenient access to common generation context properties through protected getters,
 * eliminating the need to repeatedly access `this.ctx.generation.*` throughout generator implementations.
 */
export class WithGeneration {
    public constructor(protected readonly generation: Generation) {}

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

    /** Provides access to the model navigation and inspection utilities */
    protected get model() {
        return this.generation.model;
    }
    /** Provides access to text formatting utilities */
    protected get format() {
        return this.generation.format;
    }

    /** Provides access to the type registry for looking up generated types */
    protected get registry() {
        return this.generation.registry;
    }
    /** Provides access to type information and utilities */
    protected get Types() {
        return this.generation.Types;
    }

    /** Provides access to .NET System namespace types and utilities */
    public get System() {
        return this.generation.extern.System;
    }

    /** Provides access to NUnit testing framework types */
    public get NUnit() {
        return this.generation.extern.NUnit;
    }

    /** Provides access to OneOf discriminated union library types */
    public get OneOf() {
        return this.generation.extern.OneOf;
    }

    /** Provides access to Google protocol buffer types */
    public get Google() {
        return this.generation.extern.Google;
    }
    public get Grpc() {
        return this.generation.extern.Grpc;
    }
    /** Provides access to WireMock.Net testing/mocking library types */
    public get WireMock() {
        return this.generation.extern.WireMock;
    }
    /** Provides access to primitive types */
    public get Primitive() {
        return this.generation.Primitive;
    }
    /** Provides access to value types */
    public get Value() {
        return this.generation.Value;
    }
    /** Provides access to collection types */
    public get Collection() {
        return this.generation.Collection;
    }
}
