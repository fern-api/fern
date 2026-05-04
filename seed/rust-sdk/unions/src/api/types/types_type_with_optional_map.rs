pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypeWithOptionalMap {
    #[serde(default)]
    pub key: String,
    #[serde(rename = "columnValues")]
    #[serde(default)]
    pub column_values: HashMap<String, Option<String>>,
}

impl TypeWithOptionalMap {
    pub fn builder() -> TypeWithOptionalMapBuilder {
        <TypeWithOptionalMapBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeWithOptionalMapBuilder {
    key: Option<String>,
    column_values: Option<HashMap<String, Option<String>>>,
}

impl TypeWithOptionalMapBuilder {
    pub fn key(mut self, value: impl Into<String>) -> Self {
        self.key = Some(value.into());
        self
    }

    pub fn column_values(mut self, value: HashMap<String, Option<String>>) -> Self {
        self.column_values = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypeWithOptionalMap`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key`](TypeWithOptionalMapBuilder::key)
    /// - [`column_values`](TypeWithOptionalMapBuilder::column_values)
    pub fn build(self) -> Result<TypeWithOptionalMap, BuildError> {
        Ok(TypeWithOptionalMap {
            key: self.key.ok_or_else(|| BuildError::missing_field("key"))?,
            column_values: self
                .column_values
                .ok_or_else(|| BuildError::missing_field("column_values"))?,
        })
    }
}
