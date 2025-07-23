use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CustomFiles {
        Basic {
            #[serde(flatten)]
            data: BasicCustomFiles,
        },

        Custom {
            value: HashMap<Language, Files>,
        },
}
