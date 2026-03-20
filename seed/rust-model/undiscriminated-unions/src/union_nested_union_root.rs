pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionRoot {
        String(String),

        StringList(Vec<String>),

        NestedUnionL1(NestedUnionL1),
}

impl NestedUnionRoot {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_stringlist(&self) -> bool {
        matches!(self, Self::StringList(_))
    }

    pub fn is_nestedunionl1(&self) -> bool {
        matches!(self, Self::NestedUnionL1(_))
    }


    pub fn as_string(&self) -> Option<&str> {
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

    pub fn as_stringlist(&self) -> Option<&Vec<String>> {
        match self {
                    Self::StringList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_stringlist(self) -> Option<Vec<String>> {
        match self {
                    Self::StringList(value) => Some(value),
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
