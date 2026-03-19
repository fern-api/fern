pub use crate::prelude::*;

/// Exercises all of the built-in types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    #[serde(default)]
    pub one: i64,
    #[serde(default)]
    pub two: f64,
    #[serde(default)]
    pub three: String,
    #[serde(default)]
    pub four: bool,
    #[serde(default)]
    pub five: i64,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub six: DateTime<FixedOffset>,
    #[serde(default)]
    pub seven: NaiveDate,
    #[serde(default)]
    pub eight: Uuid,
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub nine: Vec<u8>,
    #[serde(default)]
    pub ten: Vec<i64>,
    #[serde(default)]
    pub eleven: HashSet<ordered_float::OrderedFloat<f64>>,
    #[serde(default)]
    pub twelve: HashMap<String, bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thirteen: Option<i64>,
    pub fourteen: serde_json::Value,
    #[serde(default)]
    pub fifteen: Vec<Vec<i64>>,
    #[serde(default)]
    pub sixteen: Vec<HashMap<String, i64>>,
    #[serde(default)]
    pub seventeen: Vec<Option<Uuid>>,
    pub eighteen: String,
    #[serde(default)]
    pub nineteen: Name,
    #[serde(default)]
    pub twenty: i64,
    #[serde(default)]
    pub twentyone: i64,
    #[serde(default)]
    pub twentytwo: f64,
    #[serde(default)]
    #[serde(with = "crate::core::bigint_string")]
    pub twentythree: num_bigint::BigInt,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub twentyfour: Option<DateTime<FixedOffset>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub twentyfive: Option<NaiveDate>,
}