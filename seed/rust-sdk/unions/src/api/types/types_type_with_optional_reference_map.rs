pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypeWithOptionalReferenceMap {
    #[serde(default)]
    pub references: HashMap<String, Option<Foo>>,
    #[serde(default)]
    pub metadata: HashMap<String, serde_json::Value>,
}

impl TypeWithOptionalReferenceMap {
    pub fn builder() -> TypeWithOptionalReferenceMapBuilder {
        <TypeWithOptionalReferenceMapBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeWithOptionalReferenceMapBuilder {
    references: Option<HashMap<String, Option<Foo>>>,
    metadata: Option<HashMap<String, serde_json::Value>>,
}

impl TypeWithOptionalReferenceMapBuilder {
    pub fn references(mut self, value: HashMap<String, Option<Foo>>) -> Self {
        self.references = Some(value);
        self
    }

    pub fn metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypeWithOptionalReferenceMap`].
    /// This method will fail if any of the following fields are not set:
    /// - [`references`](TypeWithOptionalReferenceMapBuilder::references)
    /// - [`metadata`](TypeWithOptionalReferenceMapBuilder::metadata)
    pub fn build(self) -> Result<TypeWithOptionalReferenceMap, BuildError> {
        Ok(TypeWithOptionalReferenceMap {
            references: self
                .references
                .ok_or_else(|| BuildError::missing_field("references"))?,
            metadata: self
                .metadata
                .ok_or_else(|| BuildError::missing_field("metadata"))?,
        })
    }
}
