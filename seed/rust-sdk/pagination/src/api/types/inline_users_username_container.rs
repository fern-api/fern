pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUsernameContainer {
    #[serde(default)]
    pub results: Vec<String>,
}

impl InlineUsersUsernameContainer {
    pub fn builder() -> InlineUsersUsernameContainerBuilder {
        <InlineUsersUsernameContainerBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUsernameContainerBuilder {
    results: Option<Vec<String>>,
}

impl InlineUsersUsernameContainerBuilder {
    pub fn results(mut self, value: Vec<String>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUsernameContainer`].
    /// This method will fail if any of the following fields are not set:
    /// - [`results`](InlineUsersUsernameContainerBuilder::results)
    pub fn build(self) -> Result<InlineUsersUsernameContainer, BuildError> {
        Ok(InlineUsersUsernameContainer {
            results: self.results.ok_or_else(|| BuildError::missing_field("results"))?,
        })
    }
}
