pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum SearchResult {
        SearchResultZero(SearchResultZero),

        SearchResultOne(SearchResultOne),

        SearchResultTwo(SearchResultTwo),
}

impl SearchResult {
    pub fn is_search_result_zero(&self) -> bool {
        matches!(self, Self::SearchResultZero(_))
    }

    pub fn is_search_result_one(&self) -> bool {
        matches!(self, Self::SearchResultOne(_))
    }

    pub fn is_search_result_two(&self) -> bool {
        matches!(self, Self::SearchResultTwo(_))
    }


    pub fn as_search_result_zero(&self) -> Option<&SearchResultZero> {
        match self {
                    Self::SearchResultZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_search_result_zero(self) -> Option<SearchResultZero> {
        match self {
                    Self::SearchResultZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_search_result_one(&self) -> Option<&SearchResultOne> {
        match self {
                    Self::SearchResultOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_search_result_one(self) -> Option<SearchResultOne> {
        match self {
                    Self::SearchResultOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_search_result_two(&self) -> Option<&SearchResultTwo> {
        match self {
                    Self::SearchResultTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_search_result_two(self) -> Option<SearchResultTwo> {
        match self {
                    Self::SearchResultTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for SearchResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SearchResultZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SearchResultOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SearchResultTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
