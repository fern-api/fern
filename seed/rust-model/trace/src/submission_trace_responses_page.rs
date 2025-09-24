use crate::submission_trace_response::TraceResponse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceResponsesPage {
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i32>,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponse>,
}