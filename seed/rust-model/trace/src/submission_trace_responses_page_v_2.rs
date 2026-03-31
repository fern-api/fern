pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TraceResponsesPageV2 {
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
    #[serde(rename = "traceResponses")]
    #[serde(default)]
    pub trace_responses: Vec<TraceResponseV2>,
}

impl TraceResponsesPageV2 {
    pub fn builder() -> TraceResponsesPageV2Builder {
        <TraceResponsesPageV2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TraceResponsesPageV2Builder {
    offset: Option<i64>,
    trace_responses: Option<Vec<TraceResponseV2>>,
}

impl TraceResponsesPageV2Builder {
    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    pub fn trace_responses(mut self, value: Vec<TraceResponseV2>) -> Self {
        self.trace_responses = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TraceResponsesPageV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`trace_responses`](TraceResponsesPageV2Builder::trace_responses)
    pub fn build(self) -> Result<TraceResponsesPageV2, BuildError> {
        Ok(TraceResponsesPageV2 {
            offset: self.offset,
            trace_responses: self.trace_responses.ok_or_else(|| BuildError::missing_field("trace_responses"))?,
        })
    }
}
