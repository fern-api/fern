pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AuthGetTokenRequestGrantType {
    #[serde(rename = "client_credentials")]
    ClientCredentials,
}
impl fmt::Display for AuthGetTokenRequestGrantType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ClientCredentials => "client_credentials",
        };
        write!(f, "{}", s)
    }
}
