pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum StreamEventContextProtocol {
    StreamEventContextProtocolZero(StreamEventContextProtocolZero),

    StreamEventContextProtocolOne(StreamEventContextProtocolOne),

    StreamEventContextProtocolTwo(StreamEventContextProtocolTwo),
}

impl StreamEventContextProtocol {
    pub fn is_stream_event_context_protocol_zero(&self) -> bool {
        matches!(self, Self::StreamEventContextProtocolZero(_))
    }

    pub fn is_stream_event_context_protocol_one(&self) -> bool {
        matches!(self, Self::StreamEventContextProtocolOne(_))
    }

    pub fn is_stream_event_context_protocol_two(&self) -> bool {
        matches!(self, Self::StreamEventContextProtocolTwo(_))
    }

    pub fn as_stream_event_context_protocol_zero(&self) -> Option<&StreamEventContextProtocolZero> {
        match self {
            Self::StreamEventContextProtocolZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stream_event_context_protocol_zero(self) -> Option<StreamEventContextProtocolZero> {
        match self {
            Self::StreamEventContextProtocolZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_stream_event_context_protocol_one(&self) -> Option<&StreamEventContextProtocolOne> {
        match self {
            Self::StreamEventContextProtocolOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stream_event_context_protocol_one(self) -> Option<StreamEventContextProtocolOne> {
        match self {
            Self::StreamEventContextProtocolOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_stream_event_context_protocol_two(&self) -> Option<&StreamEventContextProtocolTwo> {
        match self {
            Self::StreamEventContextProtocolTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stream_event_context_protocol_two(self) -> Option<StreamEventContextProtocolTwo> {
        match self {
            Self::StreamEventContextProtocolTwo(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for StreamEventContextProtocol {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::StreamEventContextProtocolZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::StreamEventContextProtocolOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::StreamEventContextProtocolTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
