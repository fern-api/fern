pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ReferenceSendRequest {
    pub prompt: String,
    pub query: String,
    pub stream: bool,
    pub ending: String,
    pub context: ReferenceSomeLiteral,
    #[serde(rename = "maybeContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_context: Option<ReferenceSomeLiteral>,
    #[serde(rename = "containerObject")]
    pub container_object: ReferenceContainerObject,
}