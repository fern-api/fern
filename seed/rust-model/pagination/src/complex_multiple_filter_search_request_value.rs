pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ComplexMultipleFilterSearchRequestValue {
        MultipleFilterSearchRequestList(Vec<ComplexMultipleFilterSearchRequest>),

        SingleFilterSearchRequestList(Vec<ComplexSingleFilterSearchRequest>),
}

impl ComplexMultipleFilterSearchRequestValue {
    pub fn is_multiplefiltersearchrequestlist(&self) -> bool {
        matches!(self, Self::MultipleFilterSearchRequestList(_))
    }

    pub fn is_singlefiltersearchrequestlist(&self) -> bool {
        matches!(self, Self::SingleFilterSearchRequestList(_))
    }


    pub fn as_multiplefiltersearchrequestlist(&self) -> Option<&Vec<ComplexMultipleFilterSearchRequest>> {
        match self {
                    Self::MultipleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_multiplefiltersearchrequestlist(self) -> Option<Vec<ComplexMultipleFilterSearchRequest>> {
        match self {
                    Self::MultipleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_singlefiltersearchrequestlist(&self) -> Option<&Vec<ComplexSingleFilterSearchRequest>> {
        match self {
                    Self::SingleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_singlefiltersearchrequestlist(self) -> Option<Vec<ComplexSingleFilterSearchRequest>> {
        match self {
                    Self::SingleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

}
