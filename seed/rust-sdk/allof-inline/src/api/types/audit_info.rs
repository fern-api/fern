pub use crate::prelude::*;

/// Common audit metadata.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AuditInfo {
    /// The user who created this resource.
    #[serde(rename = "createdBy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_by: Option<String>,
    /// When this resource was created.
    #[serde(rename = "createdDateTime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub created_date_time: Option<DateTime<FixedOffset>>,
    /// The user who last modified this resource.
    #[serde(rename = "modifiedBy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified_by: Option<String>,
    /// When this resource was last modified.
    #[serde(rename = "modifiedDateTime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub modified_date_time: Option<DateTime<FixedOffset>>,
}

impl AuditInfo {
    pub fn builder() -> AuditInfoBuilder {
        <AuditInfoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuditInfoBuilder {
    created_by: Option<String>,
    created_date_time: Option<DateTime<FixedOffset>>,
    modified_by: Option<String>,
    modified_date_time: Option<DateTime<FixedOffset>>,
}

impl AuditInfoBuilder {
    pub fn created_by(mut self, value: impl Into<String>) -> Self {
        self.created_by = Some(value.into());
        self
    }

    pub fn created_date_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.created_date_time = Some(value);
        self
    }

    pub fn modified_by(mut self, value: impl Into<String>) -> Self {
        self.modified_by = Some(value.into());
        self
    }

    pub fn modified_date_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.modified_date_time = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`AuditInfo`].
    pub fn build(self) -> Result<AuditInfo, BuildError> {
        Ok(AuditInfo {
            created_by: self.created_by,
            created_date_time: self.created_date_time,
            modified_by: self.modified_by,
            modified_date_time: self.modified_date_time,
        })
    }
}
