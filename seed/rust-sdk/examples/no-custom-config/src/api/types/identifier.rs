pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Identifier {
    pub r#type: Type,
    #[serde(default)]
    pub value: String,
    #[serde(default)]
    pub label: String,
}

impl Identifier {
    pub fn builder() -> IdentifierBuilder {
        <IdentifierBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct IdentifierBuilder {
    r#type: Option<Type>,
    value: Option<String>,
    label: Option<String>,
}

impl IdentifierBuilder {
    pub fn r#type(mut self, value: Type) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    pub fn label(mut self, value: impl Into<String>) -> Self {
        self.label = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Identifier`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](IdentifierBuilder::r#type)
    /// - [`value`](IdentifierBuilder::value)
    /// - [`label`](IdentifierBuilder::label)
    pub fn build(self) -> Result<Identifier, BuildError> {
        Ok(Identifier {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
            label: self
                .label
                .ok_or_else(|| BuildError::missing_field("label"))?,
        })
    }
}
