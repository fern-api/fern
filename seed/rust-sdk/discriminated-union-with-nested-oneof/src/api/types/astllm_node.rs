pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum AstllmNode {
    AstllmNodeWithSchema(AstllmNodeWithSchema),

    AstllmNodeWithPrompt(AstllmNodeWithPrompt),
}

impl AstllmNode {
    pub fn is_astllm_node_with_schema(&self) -> bool {
        matches!(self, Self::AstllmNodeWithSchema(_))
    }

    pub fn is_astllm_node_with_prompt(&self) -> bool {
        matches!(self, Self::AstllmNodeWithPrompt(_))
    }

    pub fn as_astllm_node_with_schema(&self) -> Option<&AstllmNodeWithSchema> {
        match self {
            Self::AstllmNodeWithSchema(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_astllm_node_with_schema(self) -> Option<AstllmNodeWithSchema> {
        match self {
            Self::AstllmNodeWithSchema(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_astllm_node_with_prompt(&self) -> Option<&AstllmNodeWithPrompt> {
        match self {
            Self::AstllmNodeWithPrompt(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_astllm_node_with_prompt(self) -> Option<AstllmNodeWithPrompt> {
        match self {
            Self::AstllmNodeWithPrompt(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for AstllmNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::AstllmNodeWithSchema(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::AstllmNodeWithPrompt(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
