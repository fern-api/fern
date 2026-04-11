pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Json {
    #[serde(flatten)]
    pub docs_fields: Docs,
    #[serde(default)]
    pub raw: String,
}

impl Json {
    pub fn builder() -> JsonBuilder {
        <JsonBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JsonBuilder {
    docs_fields: Option<Docs>,
    raw: Option<String>,
}

impl JsonBuilder {
    pub fn docs_fields(mut self, value: Docs) -> Self {
        self.docs_fields = Some(value);
        self
    }

    pub fn raw(mut self, value: impl Into<String>) -> Self {
        self.raw = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Json`].
    /// This method will fail if any of the following fields are not set:
    /// - [`docs_fields`](JsonBuilder::docs_fields)
    /// - [`raw`](JsonBuilder::raw)
    pub fn build(self) -> Result<Json, BuildError> {
        Ok(Json {
            docs_fields: self.docs_fields.ok_or_else(|| BuildError::missing_field("docs_fields"))?,
            raw: self.raw.ok_or_else(|| BuildError::missing_field("raw"))?,
        })
    }
}
