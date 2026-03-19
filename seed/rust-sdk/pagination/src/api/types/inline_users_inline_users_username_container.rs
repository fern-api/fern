pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernameContainer {
    #[serde(default)]
    pub results: Vec<String>,
}
