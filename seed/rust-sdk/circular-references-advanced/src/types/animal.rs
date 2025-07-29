use crate::cat::Cat;
use crate::dog::Dog;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Animal {
        Cat(Cat),

        Dog(Dog),
}

impl Animal {
    pub fn is_cat(&self) -> bool {
        matches!(self, Self::Cat(_))
    }

    pub fn is_dog(&self) -> bool {
        matches!(self, Self::Dog(_))
    }


    pub fn as_cat(&self) -> Option<&Cat> {
        match self {
                    Self::Cat(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_cat(self) -> Option<Cat> {
        match self {
                    Self::Cat(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_dog(&self) -> Option<&Dog> {
        match self {
                    Self::Dog(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_dog(self) -> Option<Dog> {
        match self {
                    Self::Dog(value) => Some(value),
                    _ => None,
                }
    }

}
