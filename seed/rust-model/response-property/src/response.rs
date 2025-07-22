use serde::{Deserialize, Serialize};
use crate::types::with_metadata::WithMetadata;
use crate::types::with_docs::WithDocs;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Response {
    #[serde(flatten)]
    pub with_metadata_fields: WithMetadata,
    #[serde(flatten)]
    pub with_docs_fields: WithDocs,
    pub data: Movie,
}