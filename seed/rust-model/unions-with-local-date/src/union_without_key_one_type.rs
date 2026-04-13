pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithoutKeyOneType {
    #[serde(rename = "bar")]
    Bar,
}
impl fmt::Display for UnionWithoutKeyOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Bar => "bar",
        };
        write!(f, "{}", s)
    }
}
