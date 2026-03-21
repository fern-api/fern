pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Metadata {
    #[serde(rename = "createdAt")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub created_at: DateTime<FixedOffset>,
    #[serde(rename = "updatedAt")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub updated_at: DateTime<FixedOffset>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub activated: Option<bool>,
    pub status: Status,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<HashMap<String, Option<String>>>,
}

impl Metadata {
    pub fn builder() -> MetadataBuilder {
        MetadataBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MetadataBuilder {
    created_at: Option<DateTime<FixedOffset>>,
    updated_at: Option<DateTime<FixedOffset>>,
    avatar: Option<String>,
    activated: Option<bool>,
    status: Option<Status>,
    values: Option<HashMap<String, Option<String>>>,
}

impl MetadataBuilder {
    pub fn created_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.created_at = Some(value);
        self
    }

    pub fn updated_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.updated_at = Some(value);
        self
    }

    pub fn avatar(mut self, value: impl Into<String>) -> Self {
        self.avatar = Some(value.into());
        self
    }

    pub fn activated(mut self, value: bool) -> Self {
        self.activated = Some(value);
        self
    }

    pub fn status(mut self, value: Status) -> Self {
        self.status = Some(value);
        self
    }

    pub fn values(mut self, value: HashMap<String, Option<String>>) -> Self {
        self.values = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Metadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`created_at`](MetadataBuilder::created_at)
    /// - [`updated_at`](MetadataBuilder::updated_at)
    /// - [`status`](MetadataBuilder::status)
    pub fn build(self) -> Result<Metadata, BuildError> {
        Ok(Metadata {
            created_at: self.created_at.ok_or_else(|| BuildError::missing_field("created_at"))?,
            updated_at: self.updated_at.ok_or_else(|| BuildError::missing_field("updated_at"))?,
            avatar: self.avatar,
            activated: self.activated,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
            values: self.values,
        })
    }
}
