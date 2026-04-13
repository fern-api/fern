pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NotificationMethodZeroType {
    #[serde(rename = "email")]
    Email,
}
impl fmt::Display for NotificationMethodZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Email => "email",
        };
        write!(f, "{}", s)
    }
}
