use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String, // TODO: Implement proper type
    pub label: String, // TODO: Implement proper type
    pub metadata: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tree {
    pub nodes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub id: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct File {
    pub name: String, // TODO: Implement proper type
    pub contents: String, // TODO: Implement proper type
    pub info: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FileInfo {
    Regular,
    Directory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Directory {
    pub name: String, // TODO: Implement proper type
    pub files: String, // TODO: Implement proper type
    pub directories: String, // TODO: Implement proper type
}

