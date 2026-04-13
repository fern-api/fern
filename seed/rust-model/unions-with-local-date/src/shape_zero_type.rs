pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ShapeZeroType {
    #[serde(rename = "circle")]
    Circle,
}
impl fmt::Display for ShapeZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Circle => "circle",
        };
        write!(f, "{}", s)
    }
}
