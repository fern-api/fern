pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    #[serde(default)]
    pub solution_file_by_language: HashMap<Language, FileInfoV2>,
}

impl GetBasicSolutionFileResponse {
    pub fn builder() -> GetBasicSolutionFileResponseBuilder {
        <GetBasicSolutionFileResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetBasicSolutionFileResponseBuilder {
    solution_file_by_language: Option<HashMap<Language, FileInfoV2>>,
}

impl GetBasicSolutionFileResponseBuilder {
    pub fn solution_file_by_language(mut self, value: HashMap<Language, FileInfoV2>) -> Self {
        self.solution_file_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetBasicSolutionFileResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`solution_file_by_language`](GetBasicSolutionFileResponseBuilder::solution_file_by_language)
    pub fn build(self) -> Result<GetBasicSolutionFileResponse, BuildError> {
        Ok(GetBasicSolutionFileResponse {
            solution_file_by_language: self
                .solution_file_by_language
                .ok_or_else(|| BuildError::missing_field("solution_file_by_language"))?,
        })
    }
}
