pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FalseMirror {
    #[serde(default)]
    pub value: String,
}

impl FalseMirror {
    pub fn builder() -> FalseMirrorBuilder {
        FalseMirrorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FalseMirrorBuilder {
    value: Option<String>,
}

impl FalseMirrorBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FalseMirror`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](FalseMirrorBuilder::value)
    pub fn build(self) -> Result<FalseMirror, BuildError> {
        Ok(FalseMirror {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
