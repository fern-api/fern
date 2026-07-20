pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum RefreshTokenAuthRequestGrantType {
    #[serde(rename = "refresh_token")]
    RefreshToken,
}
impl fmt::Display for RefreshTokenAuthRequestGrantType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::RefreshToken => "refresh_token",
        };
        write!(f, "{}", s)
    }
}
