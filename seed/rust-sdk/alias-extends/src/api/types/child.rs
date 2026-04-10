pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Child {
    #[serde(flatten)]
    pub parent_fields: Parent,
    #[serde(default)]
    pub child: String,
}

impl Child {
    pub fn builder() -> ChildBuilder {
        <ChildBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ChildBuilder {
    parent_fields: Option<Parent>,
    child: Option<String>,
}

impl ChildBuilder {
    pub fn parent_fields(mut self, value: Parent) -> Self {
        self.parent_fields = Some(value);
        self
    }

    pub fn child(mut self, value: impl Into<String>) -> Self {
        self.child = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Child`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parent_fields`](ChildBuilder::parent_fields)
    /// - [`child`](ChildBuilder::child)
    pub fn build(self) -> Result<Child, BuildError> {
        Ok(Child {
            parent_fields: self
                .parent_fields
                .ok_or_else(|| BuildError::missing_field("parent_fields"))?,
            child: self
                .child
                .ok_or_else(|| BuildError::missing_field("child"))?,
        })
    }
}
