pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyFourType {
    #[serde(rename = "hoarseMouse")]
    HoarseMouse,
}
impl fmt::Display for BigUnionTwentyFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::HoarseMouse => "hoarseMouse",
        };
        write!(f, "{}", s)
    }
}
