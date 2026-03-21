pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RecordedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    #[serde(default)]
    pub test_case_id: TestCaseId,
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
}

impl RecordedTestCaseUpdate {
    pub fn builder() -> RecordedTestCaseUpdateBuilder {
        RecordedTestCaseUpdateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RecordedTestCaseUpdateBuilder {
    test_case_id: Option<TestCaseId>,
    trace_responses_size: Option<i64>,
}

impl RecordedTestCaseUpdateBuilder {
    pub fn test_case_id(mut self, value: TestCaseId) -> Self {
        self.test_case_id = Some(value);
        self
    }

    pub fn trace_responses_size(mut self, value: i64) -> Self {
        self.trace_responses_size = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RecordedTestCaseUpdate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case_id`](RecordedTestCaseUpdateBuilder::test_case_id)
    /// - [`trace_responses_size`](RecordedTestCaseUpdateBuilder::trace_responses_size)
    pub fn build(self) -> Result<RecordedTestCaseUpdate, BuildError> {
        Ok(RecordedTestCaseUpdate {
            test_case_id: self
                .test_case_id
                .ok_or_else(|| BuildError::missing_field("test_case_id"))?,
            trace_responses_size: self
                .trace_responses_size
                .ok_or_else(|| BuildError::missing_field("trace_responses_size"))?,
        })
    }
}
