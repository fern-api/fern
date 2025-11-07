pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithOptionalField {
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub integer: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub long: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub double: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bool: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub datetime: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date: Option<NaiveDate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uuid: Option<Uuid>,
    #[serde(rename = "base64")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base_64: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub set: Option<HashSet<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map: Option<HashMap<i64, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bigint: Option<num_bigint::BigInt>,
}
