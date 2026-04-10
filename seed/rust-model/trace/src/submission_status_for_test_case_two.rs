pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionStatusForTestCaseTwo {
    #[serde(flatten)]
    pub traced_test_case_fields: TracedTestCase,
    pub r#type: SubmissionStatusForTestCaseTwoType,
}

impl SubmissionStatusForTestCaseTwo {
    pub fn builder() -> SubmissionStatusForTestCaseTwoBuilder {
        <SubmissionStatusForTestCaseTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionStatusForTestCaseTwoBuilder {
    traced_test_case_fields: Option<TracedTestCase>,
    r#type: Option<SubmissionStatusForTestCaseTwoType>,
}

impl SubmissionStatusForTestCaseTwoBuilder {
    pub fn traced_test_case_fields(mut self, value: TracedTestCase) -> Self {
        self.traced_test_case_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionStatusForTestCaseTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionStatusForTestCaseTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`traced_test_case_fields`](SubmissionStatusForTestCaseTwoBuilder::traced_test_case_fields)
    /// - [`r#type`](SubmissionStatusForTestCaseTwoBuilder::r#type)
    pub fn build(self) -> Result<SubmissionStatusForTestCaseTwo, BuildError> {
        Ok(SubmissionStatusForTestCaseTwo {
            traced_test_case_fields: self.traced_test_case_fields.ok_or_else(|| BuildError::missing_field("traced_test_case_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
