pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ModelType {
    #[serde(rename = "model_v1")]
    ModelV1,
}
impl fmt::Display for ModelType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ModelV1 => "model_v1",
        };
        write!(f, "{}", s)
    }
}
