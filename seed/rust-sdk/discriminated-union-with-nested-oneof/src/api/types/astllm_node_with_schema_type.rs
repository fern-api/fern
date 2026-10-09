pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AstllmNodeWithSchemaType {
    #[serde(rename = "llm")]
    Llm,
}
impl fmt::Display for AstllmNodeWithSchemaType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Llm => "llm",
        };
        write!(f, "{}", s)
    }
}
