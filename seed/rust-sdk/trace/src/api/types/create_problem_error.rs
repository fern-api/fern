pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateProblemError {
    #[serde(flatten)]
    pub generic_create_problem_error_fields: GenericCreateProblemError,
    #[serde(rename = "_type")]
    pub r#type: CreateProblemErrorType,
}

impl CreateProblemError {
    pub fn builder() -> CreateProblemErrorBuilder {
        <CreateProblemErrorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateProblemErrorBuilder {
    generic_create_problem_error_fields: Option<GenericCreateProblemError>,
    r#type: Option<CreateProblemErrorType>,
}

impl CreateProblemErrorBuilder {
    pub fn generic_create_problem_error_fields(mut self, value: GenericCreateProblemError) -> Self {
        self.generic_create_problem_error_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CreateProblemErrorType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateProblemError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`generic_create_problem_error_fields`](CreateProblemErrorBuilder::generic_create_problem_error_fields)
    /// - [`r#type`](CreateProblemErrorBuilder::r#type)
    pub fn build(self) -> Result<CreateProblemError, BuildError> {
        Ok(CreateProblemError {
            generic_create_problem_error_fields: self
                .generic_create_problem_error_fields
                .ok_or_else(|| BuildError::missing_field("generic_create_problem_error_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
