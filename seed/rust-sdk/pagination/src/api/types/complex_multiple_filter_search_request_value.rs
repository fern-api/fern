pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MultipleFilterSearchRequestValue {
    MultipleFilterSearchRequestList(Vec<MultipleFilterSearchRequest>),

    SingleFilterSearchRequestList(Vec<SingleFilterSearchRequest>),
}

impl MultipleFilterSearchRequestValue {
    pub fn is_multiple_filter_search_request_list(&self) -> bool {
        matches!(self, Self::MultipleFilterSearchRequestList(_))
    }

    pub fn is_single_filter_search_request_list(&self) -> bool {
        matches!(self, Self::SingleFilterSearchRequestList(_))
    }

    pub fn as_multiple_filter_search_request_list(
        &self,
    ) -> Option<&Vec<MultipleFilterSearchRequest>> {
        match self {
            Self::MultipleFilterSearchRequestList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_multiple_filter_search_request_list(
        self,
    ) -> Option<Vec<MultipleFilterSearchRequest>> {
        match self {
            Self::MultipleFilterSearchRequestList(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_single_filter_search_request_list(&self) -> Option<&Vec<SingleFilterSearchRequest>> {
        match self {
            Self::SingleFilterSearchRequestList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_single_filter_search_request_list(self) -> Option<Vec<SingleFilterSearchRequest>> {
        match self {
            Self::SingleFilterSearchRequestList(value) => Some(value),
            _ => None,
        }
    }
}
