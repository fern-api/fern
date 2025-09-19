use crate::ast_t::T;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct U {
    pub child: T,
}
