pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlaylistCreateRequest {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub problems: Vec<ProblemId>,
}

impl PlaylistCreateRequest {
    pub fn builder() -> PlaylistCreateRequestBuilder {
        <PlaylistCreateRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlaylistCreateRequestBuilder {
    name: Option<String>,
    problems: Option<Vec<ProblemId>>,
}

impl PlaylistCreateRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn problems(mut self, value: Vec<ProblemId>) -> Self {
        self.problems = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PlaylistCreateRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](PlaylistCreateRequestBuilder::name)
    /// - [`problems`](PlaylistCreateRequestBuilder::problems)
    pub fn build(self) -> Result<PlaylistCreateRequest, BuildError> {
        Ok(PlaylistCreateRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            problems: self.problems.ok_or_else(|| BuildError::missing_field("problems"))?,
        })
    }
}
