pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum AstNode {
        #[serde(rename = "llm")]
        #[non_exhaustive]
        Llm {
            #[serde(default)]
            model: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            value_schema: Option<HashMap<String, serde_json::Value>>,
            #[serde(skip_serializing_if = "Option::is_none")]
            prompt: Option<String>,
        },

        #[serde(rename = "text")]
        #[non_exhaustive]
        Text {
            #[serde(default)]
            content: String,
        },

        #[serde(rename = "null_literal")]
        #[non_exhaustive]
        NullLiteral {},

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl AstNode {
    pub fn llm(model: String) -> Self {
        Self::Llm { model, value_schema: None, prompt: None }
    }

    pub fn text(content: String) -> Self {
        Self::Text { content }
    }

    pub fn null_literal() -> Self {
        Self::NullLiteral {}
    }

    pub fn llm_with_value_schema(model: String, value_schema: HashMap<String, serde_json::Value>, prompt: Option<String>) -> Self {
        Self::Llm { model, value_schema: Some(value_schema), prompt }
    }

    pub fn llm_with_prompt(model: String, value_schema: Option<HashMap<String, serde_json::Value>>, prompt: String) -> Self {
        Self::Llm { model, value_schema, prompt: Some(prompt) }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
