pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionStatusForTestCaseType {
    pub r#type: SubmissionStatusForTestCaseTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<TestCaseGrade>,
}

impl SubmissionStatusForTestCaseType {
    pub fn builder() -> SubmissionStatusForTestCaseTypeBuilder {
        <SubmissionStatusForTestCaseTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionStatusForTestCaseTypeBuilder {
    r#type: Option<SubmissionStatusForTestCaseTypeType>,
    value: Option<TestCaseGrade>,
}

impl SubmissionStatusForTestCaseTypeBuilder {
    pub fn r#type(mut self, value: SubmissionStatusForTestCaseTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: TestCaseGrade) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionStatusForTestCaseType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](SubmissionStatusForTestCaseTypeBuilder::r#type)
    pub fn build(self) -> Result<SubmissionStatusForTestCaseType, BuildError> {
        Ok(SubmissionStatusForTestCaseType {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
