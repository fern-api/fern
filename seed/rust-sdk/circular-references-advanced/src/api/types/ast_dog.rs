use crate::ast_fruit::Fruit;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dog {
    pub fruit: Fruit,
}
