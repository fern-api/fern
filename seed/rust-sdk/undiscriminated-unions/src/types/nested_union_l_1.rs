use crate::nested_union_l_2::NestedUnionL2;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionL1 {
        Integer(i32),

        Set1(std::collections::HashSet<String>),

        List2(Vec<String>),

        NestedUnionL2(NestedUnionL2),
}

impl NestedUnionL1 {
    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_set1(&self) -> bool {
        matches!(self, Self::Set1(_))
    }

    pub fn is_list2(&self) -> bool {
        matches!(self, Self::List2(_))
    }

    pub fn is_nestedunionl2(&self) -> bool {
        matches!(self, Self::NestedUnionL2(_))
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

    pub fn as_set1(&self) -> Option<&std::collections::HashSet<String>> {
        match self {
                    Self::Set1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_set1(self) -> Option<std::collections::HashSet<String>> {
        match self {
                    Self::Set1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list2(&self) -> Option<&Vec<String>> {
        match self {
                    Self::List2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list2(self) -> Option<Vec<String>> {
        match self {
                    Self::List2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_nestedunionl2(&self) -> Option<&NestedUnionL2> {
        match self {
                    Self::NestedUnionL2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_nestedunionl2(self) -> Option<NestedUnionL2> {
        match self {
                    Self::NestedUnionL2(value) => Some(value),
                    _ => None,
                }
    }

}
