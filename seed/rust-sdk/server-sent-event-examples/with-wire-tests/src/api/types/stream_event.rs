pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum StreamEvent {
    StreamEventZero(StreamEventZero),

    StreamEventOne(StreamEventOne),
}

impl StreamEvent {
    pub fn is_stream_event_zero(&self) -> bool {
        matches!(self, Self::StreamEventZero(_))
    }

    pub fn is_stream_event_one(&self) -> bool {
        matches!(self, Self::StreamEventOne(_))
    }

    pub fn as_stream_event_zero(&self) -> Option<&StreamEventZero> {
        match self {
            Self::StreamEventZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stream_event_zero(self) -> Option<StreamEventZero> {
        match self {
            Self::StreamEventZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_stream_event_one(&self) -> Option<&StreamEventOne> {
        match self {
            Self::StreamEventOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stream_event_one(self) -> Option<StreamEventOne> {
        match self {
            Self::StreamEventOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for StreamEvent {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::StreamEventZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::StreamEventOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
