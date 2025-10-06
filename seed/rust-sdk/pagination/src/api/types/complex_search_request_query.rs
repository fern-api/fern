pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ComplexSearchRequestQuery {
    SingleFilterSearchRequest(ComplexSingleFilterSearchRequest),

    MultipleFilterSearchRequest(ComplexMultipleFilterSearchRequest),
}

impl ComplexSearchRequestQuery {
    pub fn is_singlefiltersearchrequest(&self) -> bool {
        matches!(self, Self::SingleFilterSearchRequest(_))
    }

    pub fn is_multiplefiltersearchrequest(&self) -> bool {
        matches!(self, Self::MultipleFilterSearchRequest(_))
    }

    pub fn as_singlefiltersearchrequest(&self) -> Option<&ComplexSingleFilterSearchRequest> {
        match self {
            Self::SingleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_singlefiltersearchrequest(self) -> Option<ComplexSingleFilterSearchRequest> {
        match self {
            Self::SingleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_multiplefiltersearchrequest(&self) -> Option<&ComplexMultipleFilterSearchRequest> {
        match self {
            Self::MultipleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_multiplefiltersearchrequest(self) -> Option<ComplexMultipleFilterSearchRequest> {
        match self {
            Self::MultipleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }
}
