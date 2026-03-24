pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Bar {
    #[serde(default)]
    pub name: String,
}

impl Bar {
    pub fn builder() -> BarBuilder {
        BarBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BarBuilder {
    name: Option<String>,
}

impl BarBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Bar`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](BarBuilder::name)
    pub fn build(self) -> Result<Bar, BuildError> {
        Ok(Bar {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
