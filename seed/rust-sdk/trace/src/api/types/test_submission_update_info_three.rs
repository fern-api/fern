pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionUpdateInfoThree {
    #[serde(flatten)]
    pub graded_test_case_update_fields: GradedTestCaseUpdate,
    pub r#type: TestSubmissionUpdateInfoThreeType,
}

impl TestSubmissionUpdateInfoThree {
    pub fn builder() -> TestSubmissionUpdateInfoThreeBuilder {
        <TestSubmissionUpdateInfoThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateInfoThreeBuilder {
    graded_test_case_update_fields: Option<GradedTestCaseUpdate>,
    r#type: Option<TestSubmissionUpdateInfoThreeType>,
}

impl TestSubmissionUpdateInfoThreeBuilder {
    pub fn graded_test_case_update_fields(mut self, value: GradedTestCaseUpdate) -> Self {
        self.graded_test_case_update_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: TestSubmissionUpdateInfoThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdateInfoThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`graded_test_case_update_fields`](TestSubmissionUpdateInfoThreeBuilder::graded_test_case_update_fields)
    /// - [`r#type`](TestSubmissionUpdateInfoThreeBuilder::r#type)
    pub fn build(self) -> Result<TestSubmissionUpdateInfoThree, BuildError> {
        Ok(TestSubmissionUpdateInfoThree {
            graded_test_case_update_fields: self
                .graded_test_case_update_fields
                .ok_or_else(|| BuildError::missing_field("graded_test_case_update_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
