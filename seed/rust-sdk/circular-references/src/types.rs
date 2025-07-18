use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportingA {
    pub a: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RootType {
    pub s: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct A {
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct T {
    pub child: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct U {
    pub child: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PrimitiveValue {
    String_,
    Number,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectValue {
}

