pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AdminStoreTracedTestCaseRequest {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponses")]
    #[serde(default)]
    pub trace_responses: Vec<TraceResponse>,
}

impl AdminStoreTracedTestCaseRequest {
    pub fn builder() -> AdminStoreTracedTestCaseRequestBuilder {
        <AdminStoreTracedTestCaseRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AdminStoreTracedTestCaseRequestBuilder {
    result: Option<TestCaseResultWithStdout>,
    trace_responses: Option<Vec<TraceResponse>>,
}

impl AdminStoreTracedTestCaseRequestBuilder {
    pub fn result(mut self, value: TestCaseResultWithStdout) -> Self {
        self.result = Some(value);
        self
    }

    pub fn trace_responses(mut self, value: Vec<TraceResponse>) -> Self {
        self.trace_responses = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`AdminStoreTracedTestCaseRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`result`](AdminStoreTracedTestCaseRequestBuilder::result)
    /// - [`trace_responses`](AdminStoreTracedTestCaseRequestBuilder::trace_responses)
    pub fn build(self) -> Result<AdminStoreTracedTestCaseRequest, BuildError> {
        Ok(AdminStoreTracedTestCaseRequest {
            result: self.result.ok_or_else(|| BuildError::missing_field("result"))?,
            trace_responses: self.trace_responses.ok_or_else(|| BuildError::missing_field("trace_responses"))?,
        })
    }
}

