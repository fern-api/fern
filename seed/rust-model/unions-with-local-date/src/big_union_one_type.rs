pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionOneType {
    #[serde(rename = "thankfulFactor")]
    ThankfulFactor,
}
impl fmt::Display for BigUnionOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ThankfulFactor => "thankfulFactor",
        };
        write!(f, "{}", s)
    }
}
