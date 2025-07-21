use serde::{Deserialize, Serialize};

pub type Imported = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub foo: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Foo {
    pub foo: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderCFoo {
    pub bar_property: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub foo: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportingType {
    pub imported: String, // TODO: Implement proper type
}

pub type OptionalString = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilteredType {
    pub public_property: String, // TODO: Implement proper type
    pub private_property: String, // TODO: Implement proper type
}

