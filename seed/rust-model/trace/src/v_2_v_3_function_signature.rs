pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2V3FunctionSignature {
        V2V3FunctionSignatureZero(V2V3FunctionSignatureZero),

        V2V3FunctionSignatureOne(V2V3FunctionSignatureOne),

        V2V3FunctionSignatureTwo(V2V3FunctionSignatureTwo),
}

impl V2V3FunctionSignature {
    pub fn is_v2v3function_signature_zero(&self) -> bool {
        matches!(self, Self::V2V3FunctionSignatureZero(_))
    }

    pub fn is_v2v3function_signature_one(&self) -> bool {
        matches!(self, Self::V2V3FunctionSignatureOne(_))
    }

    pub fn is_v2v3function_signature_two(&self) -> bool {
        matches!(self, Self::V2V3FunctionSignatureTwo(_))
    }


    pub fn as_v2v3function_signature_zero(&self) -> Option<&V2V3FunctionSignatureZero> {
        match self {
                    Self::V2V3FunctionSignatureZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3function_signature_zero(self) -> Option<V2V3FunctionSignatureZero> {
        match self {
                    Self::V2V3FunctionSignatureZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_v2v3function_signature_one(&self) -> Option<&V2V3FunctionSignatureOne> {
        match self {
                    Self::V2V3FunctionSignatureOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3function_signature_one(self) -> Option<V2V3FunctionSignatureOne> {
        match self {
                    Self::V2V3FunctionSignatureOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_v2v3function_signature_two(&self) -> Option<&V2V3FunctionSignatureTwo> {
        match self {
                    Self::V2V3FunctionSignatureTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_v2v3function_signature_two(self) -> Option<V2V3FunctionSignatureTwo> {
        match self {
                    Self::V2V3FunctionSignatureTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for V2V3FunctionSignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2V3FunctionSignatureZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::V2V3FunctionSignatureOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::V2V3FunctionSignatureTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
