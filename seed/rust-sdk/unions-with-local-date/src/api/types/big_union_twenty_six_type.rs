pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentySixType {
    #[serde(rename = "potableBad")]
    PotableBad,
}
impl fmt::Display for BigUnionTwentySixType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PotableBad => "potableBad",
        };
        write!(f, "{}", s)
    }
}
