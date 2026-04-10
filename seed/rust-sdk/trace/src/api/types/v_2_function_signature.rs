pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2FunctionSignature {
    V2FunctionSignatureZero(V2FunctionSignatureZero),

    V2FunctionSignatureOne(V2FunctionSignatureOne),

    V2FunctionSignatureTwo(V2FunctionSignatureTwo),
}

impl V2FunctionSignature {
    pub fn is_v2function_signature_zero(&self) -> bool {
        matches!(self, Self::V2FunctionSignatureZero(_))
    }

    pub fn is_v2function_signature_one(&self) -> bool {
        matches!(self, Self::V2FunctionSignatureOne(_))
    }

    pub fn is_v2function_signature_two(&self) -> bool {
        matches!(self, Self::V2FunctionSignatureTwo(_))
    }

    pub fn as_v2function_signature_zero(&self) -> Option<&V2FunctionSignatureZero> {
        match self {
            Self::V2FunctionSignatureZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2function_signature_zero(self) -> Option<V2FunctionSignatureZero> {
        match self {
            Self::V2FunctionSignatureZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_v2function_signature_one(&self) -> Option<&V2FunctionSignatureOne> {
        match self {
            Self::V2FunctionSignatureOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2function_signature_one(self) -> Option<V2FunctionSignatureOne> {
        match self {
            Self::V2FunctionSignatureOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_v2function_signature_two(&self) -> Option<&V2FunctionSignatureTwo> {
        match self {
            Self::V2FunctionSignatureTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2function_signature_two(self) -> Option<V2FunctionSignatureTwo> {
        match self {
            Self::V2FunctionSignatureTwo(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for V2FunctionSignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2FunctionSignatureZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::V2FunctionSignatureOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::V2FunctionSignatureTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
