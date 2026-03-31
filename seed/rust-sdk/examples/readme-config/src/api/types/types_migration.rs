pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Migration {
    #[serde(default)]
    pub name: String,
    pub status: MigrationStatus,
}

impl Migration {
    pub fn builder() -> MigrationBuilder {
        <MigrationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MigrationBuilder {
    name: Option<String>,
    status: Option<MigrationStatus>,
}

impl MigrationBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn status(mut self, value: MigrationStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Migration`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](MigrationBuilder::name)
    /// - [`status`](MigrationBuilder::status)
    pub fn build(self) -> Result<Migration, BuildError> {
        Ok(Migration {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
