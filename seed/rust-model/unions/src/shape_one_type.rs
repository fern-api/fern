pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ShapeOneType {
    #[serde(rename = "square")]
    Square,
}
impl fmt::Display for ShapeOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Square => "square",
        };
        write!(f, "{}", s)
    }
}
