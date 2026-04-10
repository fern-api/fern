pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Parent {
    #[serde(default)]
    pub parent: String,
}

impl Parent {
    pub fn builder() -> ParentBuilder {
        <ParentBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ParentBuilder {
    parent: Option<String>,
}

impl ParentBuilder {
    pub fn parent(mut self, value: impl Into<String>) -> Self {
        self.parent = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Parent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parent`](ParentBuilder::parent)
    pub fn build(self) -> Result<Parent, BuildError> {
        Ok(Parent {
            parent: self.parent.ok_or_else(|| BuildError::missing_field("parent"))?,
        })
    }
}
