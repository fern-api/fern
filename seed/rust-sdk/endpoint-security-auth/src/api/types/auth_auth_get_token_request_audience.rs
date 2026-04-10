pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AuthGetTokenRequestAudience {
    #[serde(rename = "https://api.example.com")]
    HttpsApiExampleCom,
}
impl fmt::Display for AuthGetTokenRequestAudience {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::HttpsApiExampleCom => "https://api.example.com",
        };
        write!(f, "{}", s)
    }
}
