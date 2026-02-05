pub use crate::prelude::*;

/// Request for createUsernameWithReferencedType (body + query parameters)
///
/// Request type for the CreateUsernameWithReferencedTypeRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUsernameWithReferencedTypeRequest {
    pub tags: Vec<String>,
    pub body: CreateUsernameBody,
}
