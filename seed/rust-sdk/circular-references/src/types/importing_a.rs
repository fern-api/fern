use crate::a_a::A;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ImportingA {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub a: Option<A>,
}
