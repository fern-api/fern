pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendQueryRequest {
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_prompt: Option<String>,
    pub alias_prompt: QueryAliasToPrompt,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_optional_prompt: Option<QueryAliasToPrompt>,
    pub query: String,
    pub stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_stream: Option<bool>,
    pub alias_stream: QueryAliasToStream,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias_optional_stream: Option<QueryAliasToStream>,
}
