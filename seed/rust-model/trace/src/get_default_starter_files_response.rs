pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetDefaultStarterFilesResponse {
    #[serde(default)]
    pub files: HashMap<String, ProblemFiles>,
}

impl GetDefaultStarterFilesResponse {
    pub fn builder() -> GetDefaultStarterFilesResponseBuilder {
        <GetDefaultStarterFilesResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetDefaultStarterFilesResponseBuilder {
    files: Option<HashMap<String, ProblemFiles>>,
}

impl GetDefaultStarterFilesResponseBuilder {
    pub fn files(mut self, value: HashMap<String, ProblemFiles>) -> Self {
        self.files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetDefaultStarterFilesResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files`](GetDefaultStarterFilesResponseBuilder::files)
    pub fn build(self) -> Result<GetDefaultStarterFilesResponse, BuildError> {
        Ok(GetDefaultStarterFilesResponse {
            files: self.files.ok_or_else(|| BuildError::missing_field("files"))?,
        })
    }
}
