pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum CommonsEventInfo {
    CommonsEventInfoZero(CommonsEventInfoZero),

    CommonsEventInfoType(CommonsEventInfoType),
}

impl CommonsEventInfo {
    pub fn is_commons_event_info_zero(&self) -> bool {
        matches!(self, Self::CommonsEventInfoZero(_))
    }

    pub fn is_commons_event_info_type(&self) -> bool {
        matches!(self, Self::CommonsEventInfoType(_))
    }

    pub fn as_commons_event_info_zero(&self) -> Option<&CommonsEventInfoZero> {
        match self {
            Self::CommonsEventInfoZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_commons_event_info_zero(self) -> Option<CommonsEventInfoZero> {
        match self {
            Self::CommonsEventInfoZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_commons_event_info_type(&self) -> Option<&CommonsEventInfoType> {
        match self {
            Self::CommonsEventInfoType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_commons_event_info_type(self) -> Option<CommonsEventInfoType> {
        match self {
            Self::CommonsEventInfoType(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for CommonsEventInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::CommonsEventInfoZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::CommonsEventInfoType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
