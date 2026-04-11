pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Package {
    #[serde(default)]
    pub name: String,
}

impl Package {
    pub fn builder() -> PackageBuilder {
        <PackageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PackageBuilder {
    name: Option<String>,
}

impl PackageBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Package`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](PackageBuilder::name)
    pub fn build(self) -> Result<Package, BuildError> {
        Ok(Package {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
