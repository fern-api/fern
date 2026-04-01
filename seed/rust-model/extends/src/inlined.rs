pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Inlined {
    #[serde(default)]
    pub unique: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub docs: String,
}

impl Inlined {
    pub fn builder() -> InlinedBuilder {
        <InlinedBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlinedBuilder {
    unique: Option<String>,
    name: Option<String>,
    docs: Option<String>,
}

impl InlinedBuilder {
    pub fn unique(mut self, value: impl Into<String>) -> Self {
        self.unique = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn docs(mut self, value: impl Into<String>) -> Self {
        self.docs = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Inlined`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unique`](InlinedBuilder::unique)
    /// - [`name`](InlinedBuilder::name)
    /// - [`docs`](InlinedBuilder::docs)
    pub fn build(self) -> Result<Inlined, BuildError> {
        Ok(Inlined {
            unique: self.unique.ok_or_else(|| BuildError::missing_field("unique"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            docs: self.docs.ok_or_else(|| BuildError::missing_field("docs"))?,
        })
    }
}

