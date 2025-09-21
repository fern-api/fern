import { RelativeFilePath } from "@fern-api/fs-utils";

import { AbstractRustGeneratorContext, BaseRustCustomConfigSchema } from "../context/AbstractRustGeneratorContext";
import { RustFile } from "../project";

export class LibGenerator {
    private context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>;

    constructor(context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>) {
        this.context = context;
    }

    public generate(): RustFile {
        const libContent = this.generateLibContent();
        return new RustFile({
            filename: "lib.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: libContent
        });
    }

    private generateLibContent(): string {
        return `//! ${this.context.ir.apiDisplayName ?? this.context.ir.apiName.pascalCase.unsafeName} SDK
//!
//! This crate provides a Rust SDK for the ${this.context.ir.apiDisplayName ?? this.context.ir.apiName.pascalCase.unsafeName} API.

pub mod client;
pub mod types;
pub mod errors;

pub use client::*;
pub use types::*;
pub use errors::*;
`;
    }
}
