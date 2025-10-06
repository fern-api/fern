pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AstAcai {
    #[serde(flatten)]
    pub berry_fields: AstBerry,
}