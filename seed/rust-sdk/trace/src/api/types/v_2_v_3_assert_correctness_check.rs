pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2V3AssertCorrectnessCheck {
    V2V3AssertCorrectnessCheckZero(V2V3AssertCorrectnessCheckZero),

    V2V3AssertCorrectnessCheckOne(V2V3AssertCorrectnessCheckOne),
}

impl V2V3AssertCorrectnessCheck {
    pub fn is_v2v3assert_correctness_check_zero(&self) -> bool {
        matches!(self, Self::V2V3AssertCorrectnessCheckZero(_))
    }

    pub fn is_v2v3assert_correctness_check_one(&self) -> bool {
        matches!(self, Self::V2V3AssertCorrectnessCheckOne(_))
    }

    pub fn as_v2v3assert_correctness_check_zero(&self) -> Option<&V2V3AssertCorrectnessCheckZero> {
        match self {
            Self::V2V3AssertCorrectnessCheckZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2v3assert_correctness_check_zero(self) -> Option<V2V3AssertCorrectnessCheckZero> {
        match self {
            Self::V2V3AssertCorrectnessCheckZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_v2v3assert_correctness_check_one(&self) -> Option<&V2V3AssertCorrectnessCheckOne> {
        match self {
            Self::V2V3AssertCorrectnessCheckOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2v3assert_correctness_check_one(self) -> Option<V2V3AssertCorrectnessCheckOne> {
        match self {
            Self::V2V3AssertCorrectnessCheckOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for V2V3AssertCorrectnessCheck {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2V3AssertCorrectnessCheckZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::V2V3AssertCorrectnessCheckOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
