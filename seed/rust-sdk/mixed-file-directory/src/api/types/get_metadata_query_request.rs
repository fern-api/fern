use crate::id::Id;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    pub id: Id,
}
