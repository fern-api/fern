pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendLiteralsInHeadersRequest {
    #[serde(default)]
    pub query: String,
}
