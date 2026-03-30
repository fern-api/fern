pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct LightweightProblemInfoV22 {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemName")]
    #[serde(default)]
    pub problem_name: String,
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
    #[serde(rename = "variableTypes")]
    #[serde(default)]
    pub variable_types: HashSet<VariableType>,
}

impl LightweightProblemInfoV22 {
    pub fn builder() -> LightweightProblemInfoV22Builder {
        <LightweightProblemInfoV22Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LightweightProblemInfoV22Builder {
    problem_id: Option<ProblemId>,
    problem_name: Option<String>,
    problem_version: Option<i64>,
    variable_types: Option<HashSet<VariableType>>,
}

impl LightweightProblemInfoV22Builder {
    pub fn problem_id(mut self, value: ProblemId) -> Self {
        self.problem_id = Some(value);
        self
    }

    pub fn problem_name(mut self, value: impl Into<String>) -> Self {
        self.problem_name = Some(value.into());
        self
    }

    pub fn problem_version(mut self, value: i64) -> Self {
        self.problem_version = Some(value);
        self
    }

    pub fn variable_types(mut self, value: HashSet<VariableType>) -> Self {
        self.variable_types = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`LightweightProblemInfoV22`].
    /// This method will fail if any of the following fields are not set:
    /// - [`problem_id`](LightweightProblemInfoV22Builder::problem_id)
    /// - [`problem_name`](LightweightProblemInfoV22Builder::problem_name)
    /// - [`problem_version`](LightweightProblemInfoV22Builder::problem_version)
    /// - [`variable_types`](LightweightProblemInfoV22Builder::variable_types)
    pub fn build(self) -> Result<LightweightProblemInfoV22, BuildError> {
        Ok(LightweightProblemInfoV22 {
            problem_id: self.problem_id.ok_or_else(|| BuildError::missing_field("problem_id"))?,
            problem_name: self.problem_name.ok_or_else(|| BuildError::missing_field("problem_name"))?,
            problem_version: self.problem_version.ok_or_else(|| BuildError::missing_field("problem_version"))?,
            variable_types: self.variable_types.ok_or_else(|| BuildError::missing_field("variable_types"))?,
        })
    }
}
