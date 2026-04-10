pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2GetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    #[serde(default)]
    pub solution_file_by_language: HashMap<String, V2FileInfoV2>,
}

impl V2GetBasicSolutionFileResponse {
    pub fn builder() -> V2GetBasicSolutionFileResponseBuilder {
        <V2GetBasicSolutionFileResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GetBasicSolutionFileResponseBuilder {
    solution_file_by_language: Option<HashMap<String, V2FileInfoV2>>,
}

impl V2GetBasicSolutionFileResponseBuilder {
    pub fn solution_file_by_language(mut self, value: HashMap<String, V2FileInfoV2>) -> Self {
        self.solution_file_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GetBasicSolutionFileResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`solution_file_by_language`](V2GetBasicSolutionFileResponseBuilder::solution_file_by_language)
    pub fn build(self) -> Result<V2GetBasicSolutionFileResponse, BuildError> {
        Ok(V2GetBasicSolutionFileResponse {
            solution_file_by_language: self.solution_file_by_language.ok_or_else(|| BuildError::missing_field("solution_file_by_language"))?,
        })
    }
}
