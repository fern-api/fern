pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserEventsMetadataMetadata {
    pub id: Id,
    pub value: serde_json::Value,
}
