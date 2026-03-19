pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernameContainer2 {
    #[serde(default)]
    pub results: Vec<String>,
}