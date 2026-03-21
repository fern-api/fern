pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateProblemResponse {
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
}

impl UpdateProblemResponse {
    pub fn builder() -> UpdateProblemResponseBuilder {
        UpdateProblemResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateProblemResponseBuilder {
    problem_version: Option<i64>,
}

impl UpdateProblemResponseBuilder {
    pub fn problem_version(mut self, value: i64) -> Self {
        self.problem_version = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UpdateProblemResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_version`](UpdateProblemResponseBuilder::problem_version)
    pub fn build(self) -> Result<UpdateProblemResponse, BuildError> {
        Ok(UpdateProblemResponse {
            problem_version: self.problem_version.ok_or_else(|| BuildError::missing_field("problem_version"))?,
        })
    }
}
