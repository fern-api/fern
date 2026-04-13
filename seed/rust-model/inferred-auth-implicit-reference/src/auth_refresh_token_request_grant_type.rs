pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum RefreshTokenRequestGrantType {
    #[serde(rename = "refresh_token")]
    RefreshToken,
}
impl fmt::Display for RefreshTokenRequestGrantType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::RefreshToken => "refresh_token",
        };
        write!(f, "{}", s)
    }
}
