use crate::berry::Berry;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Acai {
    #[serde(flatten)]
    pub berry_fields: Berry,
}