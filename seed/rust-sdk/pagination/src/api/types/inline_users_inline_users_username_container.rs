pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernameContainer {
    #[serde(default)]
    pub results: Vec<String>,
}

impl UsernameContainer {
    pub fn builder() -> UsernameContainerBuilder {
        UsernameContainerBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsernameContainerBuilder {
    results: Option<Vec<String>>,
}

impl UsernameContainerBuilder {
    pub fn results(mut self, value: Vec<String>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsernameContainer`].
    /// This method will fail if any of the following fields are not set:
    /// - [`results`](UsernameContainerBuilder::results)
    pub fn build(self) -> Result<UsernameContainer, BuildError> {
        Ok(UsernameContainer {
            results: self
                .results
                .ok_or_else(|| BuildError::missing_field("results"))?,
        })
    }
}
