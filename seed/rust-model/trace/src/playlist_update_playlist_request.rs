pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdatePlaylistRequest {
    #[serde(default)]
    pub name: String,
    /// The problems that make up the playlist.
    #[serde(default)]
    pub problems: Vec<ProblemId>,
}

impl UpdatePlaylistRequest {
    pub fn builder() -> UpdatePlaylistRequestBuilder {
        UpdatePlaylistRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdatePlaylistRequestBuilder {
    name: Option<String>,
    problems: Option<Vec<ProblemId>>,
}

impl UpdatePlaylistRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn problems(mut self, value: Vec<ProblemId>) -> Self {
        self.problems = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UpdatePlaylistRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UpdatePlaylistRequestBuilder::name)
    /// - [`problems`](UpdatePlaylistRequestBuilder::problems)
    pub fn build(self) -> Result<UpdatePlaylistRequest, BuildError> {
        Ok(UpdatePlaylistRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            problems: self.problems.ok_or_else(|| BuildError::missing_field("problems"))?,
        })
    }
}
