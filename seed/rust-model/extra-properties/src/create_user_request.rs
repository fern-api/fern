pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUserRequest {
    #[serde(rename = "_type")]
    pub r#type: String,
    #[serde(rename = "_version")]
    pub version: String,
    pub name: String,
}