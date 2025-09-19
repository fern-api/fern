use crate::ast_tor_u::TorU;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct T {
    pub child: TorU,
}
