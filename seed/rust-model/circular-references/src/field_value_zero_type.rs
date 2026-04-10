pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FieldValueZeroType {
    #[serde(rename = "primitive_value")]
    PrimitiveValue,
}
impl fmt::Display for FieldValueZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PrimitiveValue => "primitive_value",
        };
        write!(f, "{}", s)
    }
}
