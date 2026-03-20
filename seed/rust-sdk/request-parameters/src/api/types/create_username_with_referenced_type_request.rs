pub use crate::prelude::*;

/// Request for createUsernameWithReferencedType (body + query parameters)
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateUsernameWithReferencedTypeRequest {
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub body: CreateUsernameBody,
}
