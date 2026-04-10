pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseGradeOne {
    #[serde(flatten)]
    pub test_case_non_hidden_grade_fields: TestCaseNonHiddenGrade,
    pub r#type: TestCaseGradeOneType,
}

impl TestCaseGradeOne {
    pub fn builder() -> TestCaseGradeOneBuilder {
        <TestCaseGradeOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseGradeOneBuilder {
    test_case_non_hidden_grade_fields: Option<TestCaseNonHiddenGrade>,
    r#type: Option<TestCaseGradeOneType>,
}

impl TestCaseGradeOneBuilder {
    pub fn test_case_non_hidden_grade_fields(mut self, value: TestCaseNonHiddenGrade) -> Self {
        self.test_case_non_hidden_grade_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: TestCaseGradeOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseGradeOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case_non_hidden_grade_fields`](TestCaseGradeOneBuilder::test_case_non_hidden_grade_fields)
    /// - [`r#type`](TestCaseGradeOneBuilder::r#type)
    pub fn build(self) -> Result<TestCaseGradeOne, BuildError> {
        Ok(TestCaseGradeOne {
            test_case_non_hidden_grade_fields: self
                .test_case_non_hidden_grade_fields
                .ok_or_else(|| BuildError::missing_field("test_case_non_hidden_grade_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
