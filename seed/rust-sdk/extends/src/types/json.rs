use serde::{Deserialize, Serialize};
use crate::types::docs::Docs;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Json {
    #[serde(flatten)]
    pub docs_fields: Docs,
    pub raw: String,
}