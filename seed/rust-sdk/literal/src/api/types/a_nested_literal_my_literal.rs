pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ANestedLiteralMyLiteral {
    #[serde(rename = "How super cool")]
    HowSuperCool,
}
impl fmt::Display for ANestedLiteralMyLiteral {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::HowSuperCool => "How super cool",
        };
        write!(f, "{}", s)
    }
}
