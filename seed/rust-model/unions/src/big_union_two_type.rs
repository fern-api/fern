pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwoType {
    #[serde(rename = "jumboEnd")]
    JumboEnd,
}
impl fmt::Display for BigUnionTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::JumboEnd => "jumboEnd",
        };
        write!(f, "{}", s)
    }
}
