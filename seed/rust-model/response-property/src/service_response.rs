use crate::service_movie::Movie;
use crate::with_metadata::WithMetadata;
use crate::service_with_docs::WithDocs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    #[serde(flatten)]
    pub with_metadata_fields: WithMetadata,
    #[serde(flatten)]
    pub with_docs_fields: WithDocs,
    pub data: Movie,
}