use crate::complex_search_request_query::SearchRequestQuery;
use crate::complex_starting_after_paging::StartingAfterPaging;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<StartingAfterPaging>,
    pub query: SearchRequestQuery,
}
