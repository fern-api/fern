pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ProblemFiles {
    #[serde(rename = "solutionFile")]
    #[serde(default)]
    pub solution_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    #[serde(default)]
    pub read_only_files: Vec<FileInfo>,
}

impl ProblemFiles {
    pub fn builder() -> ProblemFilesBuilder {
        <ProblemFilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProblemFilesBuilder {
    solution_file: Option<FileInfo>,
    read_only_files: Option<Vec<FileInfo>>,
}

impl ProblemFilesBuilder {
    pub fn solution_file(mut self, value: FileInfo) -> Self {
        self.solution_file = Some(value);
        self
    }

    pub fn read_only_files(mut self, value: Vec<FileInfo>) -> Self {
        self.read_only_files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ProblemFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`solution_file`](ProblemFilesBuilder::solution_file)
    /// - [`read_only_files`](ProblemFilesBuilder::read_only_files)
    pub fn build(self) -> Result<ProblemFiles, BuildError> {
        Ok(ProblemFiles {
            solution_file: self
                .solution_file
                .ok_or_else(|| BuildError::missing_field("solution_file"))?,
            read_only_files: self
                .read_only_files
                .ok_or_else(|| BuildError::missing_field("read_only_files"))?,
        })
    }
}
