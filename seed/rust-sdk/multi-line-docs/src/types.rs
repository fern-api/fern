use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operand {
    GreaterThan,
    EqualTo,
    LessThan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub age: String, // TODO: Implement proper type
}

