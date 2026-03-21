pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FirstItemType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(default)]
    pub name: String,
}

impl FirstItemType {
    pub fn builder() -> FirstItemTypeBuilder {
        FirstItemTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FirstItemTypeBuilder {
    r#type: Option<String>,
    name: Option<String>,
}

impl FirstItemTypeBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FirstItemType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](FirstItemTypeBuilder::name)
    pub fn build(self) -> Result<FirstItemType, BuildError> {
        Ok(FirstItemType {
            r#type: self.r#type,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
