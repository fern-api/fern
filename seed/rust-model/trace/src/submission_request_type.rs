pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRequestType {
    pub r#type: SubmissionRequestTypeType,
}

impl SubmissionRequestType {
    pub fn builder() -> SubmissionRequestTypeBuilder {
        <SubmissionRequestTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionRequestTypeBuilder {
    r#type: Option<SubmissionRequestTypeType>,
}

impl SubmissionRequestTypeBuilder {
    pub fn r#type(mut self, value: SubmissionRequestTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionRequestType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](SubmissionRequestTypeBuilder::r#type)
    pub fn build(self) -> Result<SubmissionRequestType, BuildError> {
        Ok(SubmissionRequestType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
