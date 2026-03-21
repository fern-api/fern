pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AttractiveScript {
    #[serde(default)]
    pub value: String,
}

impl AttractiveScript {
    pub fn builder() -> AttractiveScriptBuilder {
        AttractiveScriptBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AttractiveScriptBuilder {
    value: Option<String>,
}

impl AttractiveScriptBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AttractiveScript`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](AttractiveScriptBuilder::value)
    pub fn build(self) -> Result<AttractiveScript, BuildError> {
        Ok(AttractiveScript {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
