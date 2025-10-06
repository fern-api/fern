pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct EndpointsPutPutResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Vec<EndpointsPutError>>,
}
