pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithOptionalTime {
        Date {
            value: Option<NaiveDate>,
        },

        Datetime {
            value: Option<DateTime<Utc>>,
        },
}
