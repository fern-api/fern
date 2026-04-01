pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct ObjectWithMapOfMap {
    #[serde(default)]
    pub map: HashMap<String, HashMap<String, String>>,
}