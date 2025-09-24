use crate::inlined_some_aliased_literal::SomeAliasedLiteral;
use crate::inlined_a_top_level_literal::ATopLevelLiteral;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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