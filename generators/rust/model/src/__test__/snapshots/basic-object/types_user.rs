pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct User {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into, strip_option))]
    pub age: Option<i64>,
    #[serde(default)]
    pub is_active: bool,
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers")]
    pub balance: f64,
    #[serde(default)]
    pub tags: Vec<String>,
}