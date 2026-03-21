pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InitializeProblemRequest {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub problem_version: Option<i64>,
}

impl InitializeProblemRequest {
    pub fn builder() -> InitializeProblemRequestBuilder {
        InitializeProblemRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InitializeProblemRequestBuilder {
    problem_id: Option<ProblemId>,
    problem_version: Option<i64>,
}

impl InitializeProblemRequestBuilder {
    pub fn problem_id(mut self, value: ProblemId) -> Self {
        self.problem_id = Some(value);
        self
    }

    pub fn problem_version(mut self, value: i64) -> Self {
        self.problem_version = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InitializeProblemRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](InitializeProblemRequestBuilder::problem_id)
    pub fn build(self) -> Result<InitializeProblemRequest, BuildError> {
        Ok(InitializeProblemRequest {
            problem_id: self
                .problem_id
                .ok_or_else(|| BuildError::missing_field("problem_id"))?,
            problem_version: self.problem_version,
        })
    }
}
