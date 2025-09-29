use crate::ast_animal::Animal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Berry {
    pub animal: Animal,
}
