pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestCaseGradeZero {
    #[serde(flatten)]
    pub test_case_hidden_grade_fields: TestCaseHiddenGrade,
    pub r#type: TestCaseGradeZeroType,
}

impl TestCaseGradeZero {
    pub fn builder() -> TestCaseGradeZeroBuilder {
        <TestCaseGradeZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestCaseGradeZeroBuilder {
    test_case_hidden_grade_fields: Option<TestCaseHiddenGrade>,
    r#type: Option<TestCaseGradeZeroType>,
}

impl TestCaseGradeZeroBuilder {
    pub fn test_case_hidden_grade_fields(mut self, value: TestCaseHiddenGrade) -> Self {
        self.test_case_hidden_grade_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: TestCaseGradeZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestCaseGradeZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case_hidden_grade_fields`](TestCaseGradeZeroBuilder::test_case_hidden_grade_fields)
    /// - [`r#type`](TestCaseGradeZeroBuilder::r#type)
    pub fn build(self) -> Result<TestCaseGradeZero, BuildError> {
        Ok(TestCaseGradeZero {
            test_case_hidden_grade_fields: self.test_case_hidden_grade_fields.ok_or_else(|| BuildError::missing_field("test_case_hidden_grade_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
