pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionThreeType {
    #[serde(rename = "hastyPain")]
    HastyPain,
}
impl fmt::Display for BigUnionThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::HastyPain => "hastyPain",
        };
        write!(f, "{}", s)
    }
}
