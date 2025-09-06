use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MyUnion {
        String(String),

        List1(Vec<String>),

        Integer(i32),

        List3(Vec<i32>),

        List4(Vec<Vec<i32>>),

        Set5(std::collections::HashSet<String>),
}

impl MyUnion {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_list1(&self) -> bool {
        matches!(self, Self::List1(_))
    }

    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_list3(&self) -> bool {
        matches!(self, Self::List3(_))
    }

    pub fn is_list4(&self) -> bool {
        matches!(self, Self::List4(_))
    }

    pub fn is_set5(&self) -> bool {
        matches!(self, Self::Set5(_))
    }


    pub fn as_string(&self) -> Option<&String> {
        match self {
                    Self::String(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_string(self) -> Option<String> {
        match self {
                    Self::String(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list1(&self) -> Option<&Vec<String>> {
        match self {
                    Self::List1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list1(self) -> Option<Vec<String>> {
        match self {
                    Self::List1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_integer(&self) -> Option<&i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_integer(self) -> Option<i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list3(&self) -> Option<&Vec<i32>> {
        match self {
                    Self::List3(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list3(self) -> Option<Vec<i32>> {
        match self {
                    Self::List3(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list4(&self) -> Option<&Vec<Vec<i32>>> {
        match self {
                    Self::List4(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list4(self) -> Option<Vec<Vec<i32>>> {
        match self {
                    Self::List4(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_set5(&self) -> Option<&std::collections::HashSet<String>> {
        match self {
                    Self::Set5(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_set5(self) -> Option<std::collections::HashSet<String>> {
        match self {
                    Self::Set5(value) => Some(value),
                    _ => None,
                }
    }

}
