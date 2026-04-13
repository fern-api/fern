pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NotificationMethodOneType {
    #[serde(rename = "sms")]
    Sms,
}
impl fmt::Display for NotificationMethodOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Sms => "sms",
        };
        write!(f, "{}", s)
    }
}
