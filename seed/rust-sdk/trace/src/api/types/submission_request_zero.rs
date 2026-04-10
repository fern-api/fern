pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRequestZero {
    #[serde(flatten)]
    pub initialize_problem_request_fields: InitializeProblemRequest,
    pub r#type: SubmissionRequestZeroType,
}

impl SubmissionRequestZero {
    pub fn builder() -> SubmissionRequestZeroBuilder {
        <SubmissionRequestZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionRequestZeroBuilder {
    initialize_problem_request_fields: Option<InitializeProblemRequest>,
    r#type: Option<SubmissionRequestZeroType>,
}

impl SubmissionRequestZeroBuilder {
    pub fn initialize_problem_request_fields(mut self, value: InitializeProblemRequest) -> Self {
        self.initialize_problem_request_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionRequestZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionRequestZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`initialize_problem_request_fields`](SubmissionRequestZeroBuilder::initialize_problem_request_fields)
    /// - [`r#type`](SubmissionRequestZeroBuilder::r#type)
    pub fn build(self) -> Result<SubmissionRequestZero, BuildError> {
        Ok(SubmissionRequestZero {
            initialize_problem_request_fields: self
                .initialize_problem_request_fields
                .ok_or_else(|| BuildError::missing_field("initialize_problem_request_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
