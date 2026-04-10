pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum V2AssertCorrectnessCheck {
    V2AssertCorrectnessCheckZero(V2AssertCorrectnessCheckZero),

    V2AssertCorrectnessCheckOne(V2AssertCorrectnessCheckOne),
}

impl V2AssertCorrectnessCheck {
    pub fn is_v2assert_correctness_check_zero(&self) -> bool {
        matches!(self, Self::V2AssertCorrectnessCheckZero(_))
    }

    pub fn is_v2assert_correctness_check_one(&self) -> bool {
        matches!(self, Self::V2AssertCorrectnessCheckOne(_))
    }

    pub fn as_v2assert_correctness_check_zero(&self) -> Option<&V2AssertCorrectnessCheckZero> {
        match self {
            Self::V2AssertCorrectnessCheckZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2assert_correctness_check_zero(self) -> Option<V2AssertCorrectnessCheckZero> {
        match self {
            Self::V2AssertCorrectnessCheckZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_v2assert_correctness_check_one(&self) -> Option<&V2AssertCorrectnessCheckOne> {
        match self {
            Self::V2AssertCorrectnessCheckOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_v2assert_correctness_check_one(self) -> Option<V2AssertCorrectnessCheckOne> {
        match self {
            Self::V2AssertCorrectnessCheckOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for V2AssertCorrectnessCheck {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V2AssertCorrectnessCheckZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::V2AssertCorrectnessCheckOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
