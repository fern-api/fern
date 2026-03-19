pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Json {
    #[serde(flatten)]
    pub docs_fields: Docs,
    #[serde(default)]
    pub raw: String,
}
