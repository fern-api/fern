pub use crate::prelude::*;

/// Query parameters for send
///
/// Request type for the SendQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendQueryRequest {
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_prompt: Option<String>,
    pub alias_prompt: AliasToPrompt,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_optional_prompt: Option<AliasToPrompt>,
    pub query: String,
    pub stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_stream: Option<bool>,
    pub alias_stream: AliasToStream,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_optional_stream: Option<AliasToStream>,
}
