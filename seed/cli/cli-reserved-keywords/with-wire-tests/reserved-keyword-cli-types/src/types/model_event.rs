pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event_type")]
#[non_exhaustive]
pub enum ModelEvent {
        #[serde(rename = "created")]
        #[non_exhaustive]
        Created {
            #[serde(skip_serializing_if = "Option::is_none")]
            model: Option<Model>,
            #[serde(rename = "self")]
            self_: String,
        },

        #[serde(rename = "deleted")]
        #[non_exhaustive]
        Deleted {
            #[serde(skip_serializing_if = "Option::is_none")]
            #[serde(default)]
            #[serde(with = "crate::core::flexible_datetime::offset::option")]
            deleted_at: Option<DateTime<FixedOffset>>,
            #[serde(rename = "self")]
            self_: String,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl ModelEvent {
    pub fn created(self_: String) -> Self {
        Self::Created { model: None, self_ }
    }

    pub fn deleted(self_: String) -> Self {
        Self::Deleted { deleted_at: None, self_ }
    }

    pub fn created_with_model(model: Model, self_: String) -> Self {
        Self::Created { model: Some(model), self_ }
    }

    pub fn deleted_with_deleted_at(deleted_at: DateTime<FixedOffset>, self_: String) -> Self {
        Self::Deleted { deleted_at: Some(deleted_at), self_ }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_self(&self) -> &str {
        match self {
                    Self::Created { self_, .. } => self_,
                    Self::Deleted { self_, .. } => self_,
                    Self::__Unknown(_) => panic!("get_self() called on __Unknown variant; inspect the raw JSON value directly"),
                }
    }
}
