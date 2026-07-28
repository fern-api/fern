//! Request and response types for the Discriminated Union with Nested OneOf
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 6 types for data representation

pub mod ast_node;
pub mod astllm_node;
pub mod astllm_node_with_schema_type;
pub mod astllm_node_with_schema;
pub mod astllm_node_with_prompt_type;
pub mod astllm_node_with_prompt;

pub use ast_node::AstNode;
pub use astllm_node::AstllmNode;
pub use astllm_node_with_schema_type::AstllmNodeWithSchemaType;
pub use astllm_node_with_schema::AstllmNodeWithSchema;
pub use astllm_node_with_prompt_type::AstllmNodeWithPromptType;
pub use astllm_node_with_prompt::AstllmNodeWithPrompt;

