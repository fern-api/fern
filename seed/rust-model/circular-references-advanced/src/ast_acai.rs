pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Acai {
    #[serde(flatten)]
    pub berry_fields: Berry,
}
