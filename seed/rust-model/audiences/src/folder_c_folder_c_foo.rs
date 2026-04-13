pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderCFolderCFoo {
    #[serde(default)]
    pub bar_property: String,
}

impl FolderCFolderCFoo {
    pub fn builder() -> FolderCFolderCFooBuilder {
        <FolderCFolderCFooBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderCFolderCFooBuilder {
    bar_property: Option<String>,
}

impl FolderCFolderCFooBuilder {
    pub fn bar_property(mut self, value: impl Into<String>) -> Self {
        self.bar_property = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FolderCFolderCFoo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar_property`](FolderCFolderCFooBuilder::bar_property)
    pub fn build(self) -> Result<FolderCFolderCFoo, BuildError> {
        Ok(FolderCFolderCFoo {
            bar_property: self.bar_property.ok_or_else(|| BuildError::missing_field("bar_property"))?,
        })
    }
}
