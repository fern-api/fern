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
        const clientName = this.getClientName();
        return `pub mod client;
pub mod error;
pub mod types;
pub mod client_config;
pub mod http_client;
pub mod api_client_builder;
pub mod client_error;
pub mod request_options;

pub use client::{${clientName}};
pub use error::{ApiError};
pub use types::{*};
pub use client_config::{*};
pub use http_client::{*};
pub use api_client_builder::{*};
pub use client_error::{*};
pub use request_options::{*};
`;
    }

    private getClientName(): string {
        // This will be overridden by SDK-specific generators
        return this.context.ir.apiName.pascalCase.safeName + "Client";
    }
}
