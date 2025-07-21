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
pub struct Cat {
    pub fruit: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dog {
    pub fruit: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Acai {
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fig {
    pub animal: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Berry {
    pub animal: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchNode {
    pub children: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeafNode {
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodesWrapper {
    pub nodes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PrimitiveValue {
    String_,
    Number,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectValue {
}

pub type FieldName = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectFieldValue {
    pub name: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

