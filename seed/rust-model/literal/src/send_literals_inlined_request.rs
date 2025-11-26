pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SendLiteralsInlinedRequest {
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<String>,
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    pub stream: bool,
    #[serde(rename = "aliasedContext")]
    pub aliased_context: SomeAliasedLiteral,
    #[serde(rename = "maybeContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_context: Option<SomeAliasedLiteral>,
    #[serde(rename = "objectWithLiteral")]
    pub object_with_literal: ATopLevelLiteral,
}
