pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionResponseOne {
    pub r#type: SubmissionResponseOneType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ProblemId>,
}

impl SubmissionResponseOne {
    pub fn builder() -> SubmissionResponseOneBuilder {
        <SubmissionResponseOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionResponseOneBuilder {
    r#type: Option<SubmissionResponseOneType>,
    value: Option<ProblemId>,
}

impl SubmissionResponseOneBuilder {
    pub fn r#type(mut self, value: SubmissionResponseOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: ProblemId) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionResponseOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](SubmissionResponseOneBuilder::r#type)
    pub fn build(self) -> Result<SubmissionResponseOne, BuildError> {
        Ok(SubmissionResponseOne {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
