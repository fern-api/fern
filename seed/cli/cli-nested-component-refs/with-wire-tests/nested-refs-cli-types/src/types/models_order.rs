pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ModelsOrder {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub status: String,
}

impl ModelsOrder {
    pub fn builder() -> ModelsOrderBuilder {
        <ModelsOrderBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelsOrderBuilder {
    id: Option<String>,
    status: Option<String>,
}

impl ModelsOrderBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ModelsOrder`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ModelsOrderBuilder::id)
    /// - [`status`](ModelsOrderBuilder::status)
    pub fn build(self) -> Result<ModelsOrder, BuildError> {
        Ok(ModelsOrder {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
