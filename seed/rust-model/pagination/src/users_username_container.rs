pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernameContainer2 {
    #[serde(default)]
    pub results: Vec<String>,
}

impl UsernameContainer2 {
    pub fn builder() -> UsernameContainer2Builder {
        UsernameContainer2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsernameContainer2Builder {
    results: Option<Vec<String>>,
}

impl UsernameContainer2Builder {
    pub fn results(mut self, value: Vec<String>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsernameContainer2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`results`](UsernameContainer2Builder::results)
    pub fn build(self) -> Result<UsernameContainer2, BuildError> {
        Ok(UsernameContainer2 {
            results: self.results.ok_or_else(|| BuildError::missing_field("results"))?,
        })
    }
}
