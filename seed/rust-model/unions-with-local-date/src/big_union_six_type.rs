pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionSixType {
    #[serde(rename = "practicalPrinciple")]
    PracticalPrinciple,
}
impl fmt::Display for BigUnionSixType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PracticalPrinciple => "practicalPrinciple",
        };
        write!(f, "{}", s)
    }
}
