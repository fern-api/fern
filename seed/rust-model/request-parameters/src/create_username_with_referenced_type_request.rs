pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUsernameWithReferencedTypeRequest {
    pub tags: Vec<String>,
    pub body: CreateUsernameBody,
}
