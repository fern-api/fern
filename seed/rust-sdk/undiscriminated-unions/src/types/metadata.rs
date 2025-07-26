use serde::{Deserialize, Serialize};
use crate::key::Key;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Metadata(pub HashMap<Key, String>);