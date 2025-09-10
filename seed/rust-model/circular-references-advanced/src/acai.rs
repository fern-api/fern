use serde::{Deserialize, Serialize};
use crate::types::berry::Berry;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Acai {
    #[serde(flatten)]
    pub berry_fields: Berry,
}