pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithTime {
    Value { value: i64 },

    Date { value: NaiveDate },

    Datetime { value: DateTime<Utc> },
}
