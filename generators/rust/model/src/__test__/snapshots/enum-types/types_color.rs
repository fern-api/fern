pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TypesColor {
    #[serde(rename = "RED")]
    Red,
    #[serde(rename = "GREEN")]
    Green,
    #[serde(rename = "BLUE")]
    Blue,
}
impl fmt::Display for TypesColor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Red => "RED",
            Self::Green => "GREEN",
            Self::Blue => "BLUE",
        };
        write!(f, "{}", s)
    }
}
