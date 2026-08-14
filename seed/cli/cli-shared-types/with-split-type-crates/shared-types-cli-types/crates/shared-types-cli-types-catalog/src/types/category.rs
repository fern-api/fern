pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Category {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub label: String,
}

impl Category {
    pub fn builder() -> CategoryBuilder {
        <CategoryBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CategoryBuilder {
    id: Option<String>,
    label: Option<String>,
}

impl CategoryBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn label(mut self, value: impl Into<String>) -> Self {
        self.label = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Category`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](CategoryBuilder::id)
    /// - [`label`](CategoryBuilder::label)
    pub fn build(self) -> Result<Category, BuildError> {
        Ok(Category {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            label: self.label.ok_or_else(|| BuildError::missing_field("label"))?,
        })
    }
}
