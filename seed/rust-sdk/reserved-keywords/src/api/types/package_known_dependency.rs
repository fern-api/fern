pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct KnownDependency {
    #[serde(default)]
    pub name: String,
}

impl KnownDependency {
    pub fn builder() -> KnownDependencyBuilder {
        <KnownDependencyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct KnownDependencyBuilder {
    name: Option<String>,
}

impl KnownDependencyBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`KnownDependency`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](KnownDependencyBuilder::name)
    pub fn build(self) -> Result<KnownDependency, BuildError> {
        Ok(KnownDependency {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
