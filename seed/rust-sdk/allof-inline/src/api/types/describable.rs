pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Describable {
    /// Display name from Describable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// A short summary.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
}

impl Describable {
    pub fn builder() -> DescribableBuilder {
        <DescribableBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DescribableBuilder {
    name: Option<String>,
    summary: Option<String>,
}

impl DescribableBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn summary(mut self, value: impl Into<String>) -> Self {
        self.summary = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Describable`].
    pub fn build(self) -> Result<Describable, BuildError> {
        Ok(Describable {
            name: self.name,
            summary: self.summary,
        })
    }
}
