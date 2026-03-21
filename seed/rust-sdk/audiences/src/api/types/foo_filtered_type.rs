pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FilteredType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_property: Option<String>,
    #[serde(default)]
    pub private_property: i64,
}

impl FilteredType {
    pub fn builder() -> FilteredTypeBuilder {
        FilteredTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FilteredTypeBuilder {
    public_property: Option<String>,
    private_property: Option<i64>,
}

impl FilteredTypeBuilder {
    pub fn public_property(mut self, value: impl Into<String>) -> Self {
        self.public_property = Some(value.into());
        self
    }

    pub fn private_property(mut self, value: i64) -> Self {
        self.private_property = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FilteredType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`private_property`](FilteredTypeBuilder::private_property)
    pub fn build(self) -> Result<FilteredType, BuildError> {
        Ok(FilteredType {
            public_property: self.public_property,
            private_property: self
                .private_property
                .ok_or_else(|| BuildError::missing_field("private_property"))?,
        })
    }
}
