pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaginatedResponse {
    pub items: Vec<ObjectWithRequiredField>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}
