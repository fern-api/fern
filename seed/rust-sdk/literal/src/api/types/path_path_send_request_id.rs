pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PathSendRequestId {
    #[serde(rename = "123")]
    OneHundredTwentyThree,
}
impl fmt::Display for PathSendRequestId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::OneHundredTwentyThree => "123",
        };
        write!(f, "{}", s)
    }
}
