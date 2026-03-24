pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlainObject {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl PlainObject {
    pub fn builder() -> PlainObjectBuilder {
        PlainObjectBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlainObjectBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl PlainObjectBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PlainObject`].
    pub fn build(self) -> Result<PlainObject, BuildError> {
        Ok(PlainObject {
            id: self.id,
            name: self.name,
        })
    }
}
