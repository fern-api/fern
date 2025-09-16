use crate::ast_animal::Animal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Fig {
    pub animal: Animal,
}
