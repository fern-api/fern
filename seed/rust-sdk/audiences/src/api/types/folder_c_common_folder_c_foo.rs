pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderCFoo {
    #[serde(default)]
    pub bar_property: Uuid,
}

impl FolderCFoo {
    pub fn builder() -> FolderCFooBuilder {
        <FolderCFooBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderCFooBuilder {
    bar_property: Option<Uuid>,
}

impl FolderCFooBuilder {
    pub fn bar_property(mut self, value: Uuid) -> Self {
        self.bar_property = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FolderCFoo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar_property`](FolderCFooBuilder::bar_property)
    pub fn build(self) -> Result<FolderCFoo, BuildError> {
        Ok(FolderCFoo {
            bar_property: self
                .bar_property
                .ok_or_else(|| BuildError::missing_field("bar_property"))?,
        })
    }
}
