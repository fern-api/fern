use crate::basic_custom_files::BasicCustomFiles;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

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
