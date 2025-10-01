use crate::ast_fruit::Fruit;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cat {
    pub fruit: Fruit,
}