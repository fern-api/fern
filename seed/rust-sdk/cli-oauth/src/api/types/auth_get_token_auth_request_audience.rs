pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum GetTokenAuthRequestAudience {
    #[serde(rename = "pets")]
    Pets,
}
impl fmt::Display for GetTokenAuthRequestAudience {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Pets => "pets",
        };
        write!(f, "{}", s)
    }
}
