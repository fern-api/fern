use crate::nested_union_l_1::NestedUnionL1;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionRoot {
        String(String),

        List1(Vec<String>),

        NestedUnionL1(NestedUnionL1),
}

impl NestedUnionRoot {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_list1(&self) -> bool {
        matches!(self, Self::List1(_))
    }

    pub fn is_nestedunionl1(&self) -> bool {
        matches!(self, Self::NestedUnionL1(_))
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

    pub fn as_nestedunionl1(&self) -> Option<&NestedUnionL1> {
        match self {
                    Self::NestedUnionL1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_nestedunionl1(self) -> Option<NestedUnionL1> {
        match self {
                    Self::NestedUnionL1(value) => Some(value),
                    _ => None,
                }
    }

}
