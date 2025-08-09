use chrono::{DateTime, NaiveDate, Utc};
use std::collections::HashMap;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithOptionalField {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub integer: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub long: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub double: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bool: Option<bool>,
    #[serde(with = "chrono::serde::ts_seconds_option")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub datetime: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date: Option<chrono::NaiveDate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uuid: Option<uuid::Uuid>,
    #[serde(rename = "base64")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base_64: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub set: Option<std::collections::HashSet<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map: Option<HashMap<i32, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bigint: Option<num_bigint::BigInt>,
}