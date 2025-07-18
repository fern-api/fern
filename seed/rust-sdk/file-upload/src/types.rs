use serde::{Deserialize, Serialize};

pub type Id = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MyObjectWithOptional {
    pub prop: String, // TODO: Implement proper type
    pub optional_prop: String, // TODO: Implement proper type
}

pub type MyAliasObject = String; // TODO: Implement proper type

pub type MyCollectionAliasObject = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MyObject {
    pub foo: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ObjectType {
    Foo,
    Bar,
}

