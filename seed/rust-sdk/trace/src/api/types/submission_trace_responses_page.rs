pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TraceResponsesPage {
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
    #[serde(rename = "traceResponses")]
    #[serde(default)]
    pub trace_responses: Vec<TraceResponse>,
}

impl TraceResponsesPage {
    pub fn builder() -> TraceResponsesPageBuilder {
        <TraceResponsesPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TraceResponsesPageBuilder {
    offset: Option<i64>,
    trace_responses: Option<Vec<TraceResponse>>,
}

impl TraceResponsesPageBuilder {
    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    pub fn trace_responses(mut self, value: Vec<TraceResponse>) -> Self {
        self.trace_responses = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TraceResponsesPage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`trace_responses`](TraceResponsesPageBuilder::trace_responses)
    pub fn build(self) -> Result<TraceResponsesPage, BuildError> {
        Ok(TraceResponsesPage {
            offset: self.offset,
            trace_responses: self
                .trace_responses
                .ok_or_else(|| BuildError::missing_field("trace_responses"))?,
        })
    }
}
