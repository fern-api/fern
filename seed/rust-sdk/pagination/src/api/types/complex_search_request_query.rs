pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SearchRequestQuery {
    SingleFilterSearchRequest(SingleFilterSearchRequest),

    MultipleFilterSearchRequest(MultipleFilterSearchRequest),
}

impl SearchRequestQuery {
    pub fn is_single_filter_search_request(&self) -> bool {
        matches!(self, Self::SingleFilterSearchRequest(_))
    }

    pub fn is_multiple_filter_search_request(&self) -> bool {
        matches!(self, Self::MultipleFilterSearchRequest(_))
    }

    pub fn as_single_filter_search_request(&self) -> Option<&SingleFilterSearchRequest> {
        match self {
            Self::SingleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_single_filter_search_request(self) -> Option<SingleFilterSearchRequest> {
        match self {
            Self::SingleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_multiple_filter_search_request(&self) -> Option<&MultipleFilterSearchRequest> {
        match self {
            Self::MultipleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_multiple_filter_search_request(self) -> Option<MultipleFilterSearchRequest> {
        match self {
            Self::MultipleFilterSearchRequest(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for SearchRequestQuery {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SingleFilterSearchRequest(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::MultipleFilterSearchRequest(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
