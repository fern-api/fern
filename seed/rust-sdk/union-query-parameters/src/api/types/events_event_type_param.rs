pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum EventTypeParam {
    EventTypeEnum(EventTypeEnum),

    EventTypeEnumList(Vec<EventTypeEnum>),
}

impl EventTypeParam {
    pub fn is_event_type_enum(&self) -> bool {
        matches!(self, Self::EventTypeEnum(_))
    }

    pub fn is_event_type_enum_list(&self) -> bool {
        matches!(self, Self::EventTypeEnumList(_))
    }

    pub fn as_event_type_enum(&self) -> Option<&EventTypeEnum> {
        match self {
            Self::EventTypeEnum(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_event_type_enum(self) -> Option<EventTypeEnum> {
        match self {
            Self::EventTypeEnum(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_event_type_enum_list(&self) -> Option<&Vec<EventTypeEnum>> {
        match self {
            Self::EventTypeEnumList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_event_type_enum_list(self) -> Option<Vec<EventTypeEnum>> {
        match self {
            Self::EventTypeEnumList(value) => Some(value),
            _ => None,
        }
    }
}
