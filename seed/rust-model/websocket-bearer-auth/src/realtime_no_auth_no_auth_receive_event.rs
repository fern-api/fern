pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NoAuthReceiveEvent {
    #[serde(default)]
    pub response: String,
}