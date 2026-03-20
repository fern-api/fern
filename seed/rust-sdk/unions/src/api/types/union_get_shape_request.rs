pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetShapeRequest {
    #[serde(default)]
    pub id: String,
}