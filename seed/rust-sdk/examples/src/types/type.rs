use crate::basic_type::BasicType;
use crate::complex_type::ComplexType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Type {
        BasicType(BasicType),

        ComplexType(ComplexType),
}

impl Type {
    pub fn is_basictype(&self) -> bool {
        matches!(self, Self::BasicType(_))
    }

    pub fn is_complextype(&self) -> bool {
        matches!(self, Self::ComplexType(_))
    }


    pub fn as_basictype(&self) -> Option<&BasicType> {
        match self {
                    Self::BasicType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_basictype(self) -> Option<BasicType> {
        match self {
                    Self::BasicType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_complextype(&self) -> Option<&ComplexType> {
        match self {
                    Self::ComplexType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_complextype(self) -> Option<ComplexType> {
        match self {
                    Self::ComplexType(value) => Some(value),
                    _ => None,
                }
    }

}
