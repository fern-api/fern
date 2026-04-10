pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum NotificationMethod {
        NotificationMethodZero(NotificationMethodZero),

        NotificationMethodOne(NotificationMethodOne),

        NotificationMethodTwo(NotificationMethodTwo),
}

impl NotificationMethod {
    pub fn is_notification_method_zero(&self) -> bool {
        matches!(self, Self::NotificationMethodZero(_))
    }

    pub fn is_notification_method_one(&self) -> bool {
        matches!(self, Self::NotificationMethodOne(_))
    }

    pub fn is_notification_method_two(&self) -> bool {
        matches!(self, Self::NotificationMethodTwo(_))
    }


    pub fn as_notification_method_zero(&self) -> Option<&NotificationMethodZero> {
        match self {
                    Self::NotificationMethodZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_notification_method_zero(self) -> Option<NotificationMethodZero> {
        match self {
                    Self::NotificationMethodZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_notification_method_one(&self) -> Option<&NotificationMethodOne> {
        match self {
                    Self::NotificationMethodOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_notification_method_one(self) -> Option<NotificationMethodOne> {
        match self {
                    Self::NotificationMethodOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_notification_method_two(&self) -> Option<&NotificationMethodTwo> {
        match self {
                    Self::NotificationMethodTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_notification_method_two(self) -> Option<NotificationMethodTwo> {
        match self {
                    Self::NotificationMethodTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for NotificationMethod {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotificationMethodZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::NotificationMethodOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::NotificationMethodTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
