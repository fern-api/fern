pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionResponseTwo {
    pub r#type: SubmissionResponseTwoType,
}

impl SubmissionResponseTwo {
    pub fn builder() -> SubmissionResponseTwoBuilder {
        <SubmissionResponseTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionResponseTwoBuilder {
    r#type: Option<SubmissionResponseTwoType>,
}

impl SubmissionResponseTwoBuilder {
    pub fn r#type(mut self, value: SubmissionResponseTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionResponseTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](SubmissionResponseTwoBuilder::r#type)
    pub fn build(self) -> Result<SubmissionResponseTwo, BuildError> {
        Ok(SubmissionResponseTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
