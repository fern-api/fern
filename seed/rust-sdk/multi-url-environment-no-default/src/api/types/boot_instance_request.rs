pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BootInstanceRequest {
    #[serde(default)]
    pub size: String,
}
