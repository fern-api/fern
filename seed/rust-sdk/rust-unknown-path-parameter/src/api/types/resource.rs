pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Resource {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
}

impl Resource {
    pub fn builder() -> ResourceBuilder {
        <ResourceBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResourceBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl ResourceBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Resource`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ResourceBuilder::id)
    /// - [`name`](ResourceBuilder::name)
    pub fn build(self) -> Result<Resource, BuildError> {
        Ok(Resource {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
