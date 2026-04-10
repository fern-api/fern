pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionStatusForTestCaseZero {
    #[serde(flatten)]
    pub test_case_result_with_stdout_fields: TestCaseResultWithStdout,
    pub r#type: SubmissionStatusForTestCaseZeroType,
}

impl SubmissionStatusForTestCaseZero {
    pub fn builder() -> SubmissionStatusForTestCaseZeroBuilder {
        <SubmissionStatusForTestCaseZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionStatusForTestCaseZeroBuilder {
    test_case_result_with_stdout_fields: Option<TestCaseResultWithStdout>,
    r#type: Option<SubmissionStatusForTestCaseZeroType>,
}

impl SubmissionStatusForTestCaseZeroBuilder {
    pub fn test_case_result_with_stdout_fields(mut self, value: TestCaseResultWithStdout) -> Self {
        self.test_case_result_with_stdout_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionStatusForTestCaseZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionStatusForTestCaseZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case_result_with_stdout_fields`](SubmissionStatusForTestCaseZeroBuilder::test_case_result_with_stdout_fields)
    /// - [`r#type`](SubmissionStatusForTestCaseZeroBuilder::r#type)
    pub fn build(self) -> Result<SubmissionStatusForTestCaseZero, BuildError> {
        Ok(SubmissionStatusForTestCaseZero {
            test_case_result_with_stdout_fields: self
                .test_case_result_with_stdout_fields
                .ok_or_else(|| BuildError::missing_field("test_case_result_with_stdout_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
