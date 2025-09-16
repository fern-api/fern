use crate::docs::Docs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExampleType {
    #[serde(flatten)]
    pub docs_fields: Docs,
    pub name: String,
}