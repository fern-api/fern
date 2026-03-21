pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetBasicSolutionFileResponse2 {
    #[serde(rename = "solutionFileByLanguage")]
    #[serde(default)]
    pub solution_file_by_language: HashMap<Language, FileInfoV22>,
}

impl GetBasicSolutionFileResponse2 {
    pub fn builder() -> GetBasicSolutionFileResponse2Builder {
        GetBasicSolutionFileResponse2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetBasicSolutionFileResponse2Builder {
    solution_file_by_language: Option<HashMap<Language, FileInfoV22>>,
}

impl GetBasicSolutionFileResponse2Builder {
    pub fn solution_file_by_language(mut self, value: HashMap<Language, FileInfoV22>) -> Self {
        self.solution_file_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetBasicSolutionFileResponse2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`solution_file_by_language`](GetBasicSolutionFileResponse2Builder::solution_file_by_language)
    pub fn build(self) -> Result<GetBasicSolutionFileResponse2, BuildError> {
        Ok(GetBasicSolutionFileResponse2 {
            solution_file_by_language: self
                .solution_file_by_language
                .ok_or_else(|| BuildError::missing_field("solution_file_by_language"))?,
        })
    }
}
