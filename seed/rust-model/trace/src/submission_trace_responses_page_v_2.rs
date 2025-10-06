pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TraceResponsesPageV2 {
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponseV2>,
}