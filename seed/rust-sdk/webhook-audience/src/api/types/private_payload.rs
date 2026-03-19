pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PrivatePayload {
    #[serde(default)]
    pub secret: String,
}
