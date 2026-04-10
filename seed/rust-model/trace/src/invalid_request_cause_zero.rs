pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InvalidRequestCauseZero {
    #[serde(flatten)]
    pub submission_id_not_found_fields: SubmissionIdNotFound,
    pub r#type: InvalidRequestCauseZeroType,
}

impl InvalidRequestCauseZero {
    pub fn builder() -> InvalidRequestCauseZeroBuilder {
        <InvalidRequestCauseZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InvalidRequestCauseZeroBuilder {
    submission_id_not_found_fields: Option<SubmissionIdNotFound>,
    r#type: Option<InvalidRequestCauseZeroType>,
}

impl InvalidRequestCauseZeroBuilder {
    pub fn submission_id_not_found_fields(mut self, value: SubmissionIdNotFound) -> Self {
        self.submission_id_not_found_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: InvalidRequestCauseZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InvalidRequestCauseZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id_not_found_fields`](InvalidRequestCauseZeroBuilder::submission_id_not_found_fields)
    /// - [`r#type`](InvalidRequestCauseZeroBuilder::r#type)
    pub fn build(self) -> Result<InvalidRequestCauseZero, BuildError> {
        Ok(InvalidRequestCauseZero {
            submission_id_not_found_fields: self.submission_id_not_found_fields.ok_or_else(|| BuildError::missing_field("submission_id_not_found_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
