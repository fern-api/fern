pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTypeStateZero {
    #[serde(flatten)]
    pub test_submission_state_fields: TestSubmissionState,
    pub r#type: SubmissionTypeStateZeroType,
}

impl SubmissionTypeStateZero {
    pub fn builder() -> SubmissionTypeStateZeroBuilder {
        <SubmissionTypeStateZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionTypeStateZeroBuilder {
    test_submission_state_fields: Option<TestSubmissionState>,
    r#type: Option<SubmissionTypeStateZeroType>,
}

impl SubmissionTypeStateZeroBuilder {
    pub fn test_submission_state_fields(mut self, value: TestSubmissionState) -> Self {
        self.test_submission_state_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionTypeStateZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionTypeStateZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_submission_state_fields`](SubmissionTypeStateZeroBuilder::test_submission_state_fields)
    /// - [`r#type`](SubmissionTypeStateZeroBuilder::r#type)
    pub fn build(self) -> Result<SubmissionTypeStateZero, BuildError> {
        Ok(SubmissionTypeStateZero {
            test_submission_state_fields: self.test_submission_state_fields.ok_or_else(|| BuildError::missing_field("test_submission_state_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
