pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SecondItemType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(default)]
    pub title: String,
}

impl SecondItemType {
    pub fn builder() -> SecondItemTypeBuilder {
        SecondItemTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SecondItemTypeBuilder {
    r#type: Option<String>,
    title: Option<String>,
}

impl SecondItemTypeBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SecondItemType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`title`](SecondItemTypeBuilder::title)
    pub fn build(self) -> Result<SecondItemType, BuildError> {
        Ok(SecondItemType {
            r#type: self.r#type,
            title: self.title.ok_or_else(|| BuildError::missing_field("title"))?,
        })
    }
}
