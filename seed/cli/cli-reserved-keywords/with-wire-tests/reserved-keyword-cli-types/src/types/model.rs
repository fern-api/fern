pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Model {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_by: Option<CreatedBy>,
}

impl Model {
    pub fn builder() -> ModelBuilder {
        <ModelBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelBuilder {
    id: Option<String>,
    created_by: Option<CreatedBy>,
}

impl ModelBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn created_by(mut self, value: CreatedBy) -> Self {
        self.created_by = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Model`].
    pub fn build(self) -> Result<Model, BuildError> {
        Ok(Model {
            id: self.id,
            created_by: self.created_by,
        })
    }
}
