pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ActualResult {
    ActualResultZero(ActualResultZero),

    ActualResultOne(ActualResultOne),

    ActualResultTwo(ActualResultTwo),
}

impl ActualResult {
    pub fn is_actual_result_zero(&self) -> bool {
        matches!(self, Self::ActualResultZero(_))
    }

    pub fn is_actual_result_one(&self) -> bool {
        matches!(self, Self::ActualResultOne(_))
    }

    pub fn is_actual_result_two(&self) -> bool {
        matches!(self, Self::ActualResultTwo(_))
    }

    pub fn as_actual_result_zero(&self) -> Option<&ActualResultZero> {
        match self {
            Self::ActualResultZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_actual_result_zero(self) -> Option<ActualResultZero> {
        match self {
            Self::ActualResultZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_actual_result_one(&self) -> Option<&ActualResultOne> {
        match self {
            Self::ActualResultOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_actual_result_one(self) -> Option<ActualResultOne> {
        match self {
            Self::ActualResultOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_actual_result_two(&self) -> Option<&ActualResultTwo> {
        match self {
            Self::ActualResultTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_actual_result_two(self) -> Option<ActualResultTwo> {
        match self {
            Self::ActualResultTwo(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for ActualResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ActualResultZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::ActualResultOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::ActualResultTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
