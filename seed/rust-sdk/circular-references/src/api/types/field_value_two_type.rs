pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FieldValueTwoType {
    #[serde(rename = "container_value")]
    ContainerValue,
}
impl fmt::Display for FieldValueTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ContainerValue => "container_value",
        };
        write!(f, "{}", s)
    }
}
