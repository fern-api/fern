pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendLiteralsInHeadersRequest {
    #[serde(default)]
    pub query: String,
}
