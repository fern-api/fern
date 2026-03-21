pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithName {
    #[serde(default)]
    pub name: String,
}

impl WithName {
    pub fn builder() -> WithNameBuilder {
        WithNameBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithNameBuilder {
    name: Option<String>,
}

impl WithNameBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WithName`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](WithNameBuilder::name)
    pub fn build(self) -> Result<WithName, BuildError> {
        Ok(WithName {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
