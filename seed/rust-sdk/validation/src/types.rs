use serde::{Deserialize, Serialize};

pub type SmallInteger = String; // TODO: Implement proper type

pub type LargeInteger = String; // TODO: Implement proper type

pub type Double = String; // TODO: Implement proper type

pub type Word = String; // TODO: Implement proper type

pub type Sentence = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Shape {
    Square,
    Circle,
    Triangle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Type {
    pub decimal: String, // TODO: Implement proper type
    pub even: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub shape: String, // TODO: Implement proper type
}

