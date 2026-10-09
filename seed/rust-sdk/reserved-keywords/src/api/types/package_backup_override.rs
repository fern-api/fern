pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BackupOverride {
    #[serde(default)]
    pub model: String,
}

impl BackupOverride {
    pub fn builder() -> BackupOverrideBuilder {
        <BackupOverrideBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BackupOverrideBuilder {
    model: Option<String>,
}

impl BackupOverrideBuilder {
    pub fn model(mut self, value: impl Into<String>) -> Self {
        self.model = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BackupOverride`].
    /// This method will fail if any of the following fields are not set:
    /// - [`model`](BackupOverrideBuilder::model)
    pub fn build(self) -> Result<BackupOverride, BuildError> {
        Ok(BackupOverride {
            model: self
                .model
                .ok_or_else(|| BuildError::missing_field("model"))?,
        })
    }
}
