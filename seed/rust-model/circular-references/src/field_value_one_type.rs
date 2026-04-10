pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FieldValueOneType {
    #[serde(rename = "object_value")]
    ObjectValue,
}
impl fmt::Display for FieldValueOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ObjectValue => "object_value",
        };
        write!(f, "{}", s)
    }
}
