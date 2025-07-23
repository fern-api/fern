use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MultipleFilterSearchRequestValue {
        List(Vec<MultipleFilterSearchRequest>),

        List(Vec<SingleFilterSearchRequest>),
}

impl MultipleFilterSearchRequestValue {
    pub fn is_list(&self) -> bool {
        matches!(self, Self::List(_))
    }

    pub fn is_list(&self) -> bool {
        matches!(self, Self::List(_))
    }


    pub fn as_list(&self) -> Option<&Vec<MultipleFilterSearchRequest>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list(self) -> Option<Vec<MultipleFilterSearchRequest>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list(&self) -> Option<&Vec<SingleFilterSearchRequest>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list(self) -> Option<Vec<SingleFilterSearchRequest>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

}
