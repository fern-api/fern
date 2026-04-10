pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestSubmissionUpdateInfoFour {
    #[serde(flatten)]
    pub recorded_test_case_update_fields: RecordedTestCaseUpdate,
    pub r#type: TestSubmissionUpdateInfoFourType,
}

impl TestSubmissionUpdateInfoFour {
    pub fn builder() -> TestSubmissionUpdateInfoFourBuilder {
        <TestSubmissionUpdateInfoFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateInfoFourBuilder {
    recorded_test_case_update_fields: Option<RecordedTestCaseUpdate>,
    r#type: Option<TestSubmissionUpdateInfoFourType>,
}

impl TestSubmissionUpdateInfoFourBuilder {
    pub fn recorded_test_case_update_fields(mut self, value: RecordedTestCaseUpdate) -> Self {
        self.recorded_test_case_update_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: TestSubmissionUpdateInfoFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdateInfoFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`recorded_test_case_update_fields`](TestSubmissionUpdateInfoFourBuilder::recorded_test_case_update_fields)
    /// - [`r#type`](TestSubmissionUpdateInfoFourBuilder::r#type)
    pub fn build(self) -> Result<TestSubmissionUpdateInfoFour, BuildError> {
        Ok(TestSubmissionUpdateInfoFour {
            recorded_test_case_update_fields: self.recorded_test_case_update_fields.ok_or_else(|| BuildError::missing_field("recorded_test_case_update_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
