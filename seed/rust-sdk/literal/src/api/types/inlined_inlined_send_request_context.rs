pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum InlinedSendRequestContext {
    #[serde(rename = "You're super wise")]
    YoureSuperWise,
}
impl fmt::Display for InlinedSendRequestContext {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::YoureSuperWise => "You're super wise",
        };
        write!(f, "{}", s)
    }
}
