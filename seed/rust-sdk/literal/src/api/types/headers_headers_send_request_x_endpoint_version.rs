pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum HeadersSendRequestXEndpointVersion {
    #[serde(rename = "02-12-2024")]
    Two122024,
}
impl fmt::Display for HeadersSendRequestXEndpointVersion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Two122024 => "02-12-2024",
        };
        write!(f, "{}", s)
    }
}
