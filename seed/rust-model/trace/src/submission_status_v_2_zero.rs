pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionStatusV2Zero {
    #[serde(flatten)]
    pub test_submission_status_v2_fields: TestSubmissionStatusV2,
    pub r#type: SubmissionStatusV2ZeroType,
}

impl SubmissionStatusV2Zero {
    pub fn builder() -> SubmissionStatusV2ZeroBuilder {
        <SubmissionStatusV2ZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionStatusV2ZeroBuilder {
    test_submission_status_v2_fields: Option<TestSubmissionStatusV2>,
    r#type: Option<SubmissionStatusV2ZeroType>,
}

impl SubmissionStatusV2ZeroBuilder {
    pub fn test_submission_status_v2_fields(mut self, value: TestSubmissionStatusV2) -> Self {
        self.test_submission_status_v2_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionStatusV2ZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionStatusV2Zero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_submission_status_v2_fields`](SubmissionStatusV2ZeroBuilder::test_submission_status_v2_fields)
    /// - [`r#type`](SubmissionStatusV2ZeroBuilder::r#type)
    pub fn build(self) -> Result<SubmissionStatusV2Zero, BuildError> {
        Ok(SubmissionStatusV2Zero {
            test_submission_status_v2_fields: self.test_submission_status_v2_fields.ok_or_else(|| BuildError::missing_field("test_submission_status_v2_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
