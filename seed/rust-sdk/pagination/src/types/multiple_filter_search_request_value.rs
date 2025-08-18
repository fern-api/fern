use crate::multiple_filter_search_request::MultipleFilterSearchRequest;
use crate::single_filter_search_request::SingleFilterSearchRequest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MultipleFilterSearchRequestValue {
        MultipleFilterSearchRequestList(Vec<MultipleFilterSearchRequest>),

        SingleFilterSearchRequestList(Vec<SingleFilterSearchRequest>),
}

impl MultipleFilterSearchRequestValue {
    pub fn is_multiplefiltersearchrequestlist(&self) -> bool {
        matches!(self, Self::MultipleFilterSearchRequestList(_))
    }

    pub fn is_singlefiltersearchrequestlist(&self) -> bool {
        matches!(self, Self::SingleFilterSearchRequestList(_))
    }


    pub fn as_multiplefiltersearchrequestlist(&self) -> Option<&Vec<MultipleFilterSearchRequest>> {
        match self {
                    Self::MultipleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_multiplefiltersearchrequestlist(self) -> Option<Vec<MultipleFilterSearchRequest>> {
        match self {
                    Self::MultipleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_singlefiltersearchrequestlist(&self) -> Option<&Vec<SingleFilterSearchRequest>> {
        match self {
                    Self::SingleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_singlefiltersearchrequestlist(self) -> Option<Vec<SingleFilterSearchRequest>> {
        match self {
                    Self::SingleFilterSearchRequestList(value) => Some(value),
                    _ => None,
                }
    }

}
