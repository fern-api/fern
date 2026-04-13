pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionSixteenType {
    #[serde(rename = "gruesomeCoach")]
    GruesomeCoach,
}
impl fmt::Display for BigUnionSixteenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GruesomeCoach => "gruesomeCoach",
        };
        write!(f, "{}", s)
    }
}
