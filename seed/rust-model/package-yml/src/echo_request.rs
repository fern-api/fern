pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EchoRequest {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub size: i64,
}