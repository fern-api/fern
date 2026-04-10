pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionResponseZero {
    pub r#type: SubmissionResponseZeroType,
}

impl SubmissionResponseZero {
    pub fn builder() -> SubmissionResponseZeroBuilder {
        <SubmissionResponseZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionResponseZeroBuilder {
    r#type: Option<SubmissionResponseZeroType>,
}

impl SubmissionResponseZeroBuilder {
    pub fn r#type(mut self, value: SubmissionResponseZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionResponseZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](SubmissionResponseZeroBuilder::r#type)
    pub fn build(self) -> Result<SubmissionResponseZero, BuildError> {
        Ok(SubmissionResponseZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
