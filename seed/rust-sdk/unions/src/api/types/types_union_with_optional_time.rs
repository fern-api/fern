use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithOptionalTime {
    Date { value: Option<NaiveDate> },

    Datetime { value: Option<DateTime<Utc>> },
}
