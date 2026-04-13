pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NotificationMethodTwoType {
    #[serde(rename = "push")]
    Push,
}
impl fmt::Display for NotificationMethodTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Push => "push",
        };
        write!(f, "{}", s)
    }
}
