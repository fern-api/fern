pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NoAuthSendEvent {
    #[serde(default)]
    pub text: String,
}