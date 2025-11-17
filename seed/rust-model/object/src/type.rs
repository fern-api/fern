pub use crate::prelude::*;

/// Exercises all of the built-in types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    pub one: i64,
    pub two: f64,
    pub three: String,
    pub four: bool,
    pub five: i64,
    pub six: DateTime<Utc>,
    pub seven: NaiveDate,
    pub eight: Uuid,
    pub nine: Vec<u8>,
    pub ten: Vec<i64>,
    pub eleven: HashSet<ordered_float::OrderedFloat<f64>>,
    pub twelve: HashMap<String, bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thirteen: Option<i64>,
    pub fourteen: serde_json::Value,
    pub fifteen: Vec<Vec<i64>>,
    pub sixteen: Vec<HashMap<String, i64>>,
    pub seventeen: Vec<Option<Uuid>>,
    pub eighteen: String,
    pub nineteen: Name,
    pub twenty: i64,
    pub twentyone: i64,
    pub twentytwo: f64,
    pub twentythree: num_bigint::BigInt,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub twentyfour: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub twentyfive: Option<NaiveDate>,
}