pub use crate::prelude::*;

/// Query parameters for getMetadata
///
/// Request type for the GetMetadataQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    pub id: Id,
}
