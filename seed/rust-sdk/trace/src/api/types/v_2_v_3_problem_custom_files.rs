use crate::v_2_problem_basic_custom_files::BasicCustomFiles;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
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
