pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RefreshTokenRequest {
    #[serde(default)]
    pub ttl: i64,
}
