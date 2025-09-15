use crate::v_2_problem_file_info_v_2::FileInfoV2;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Files {
    pub files: Vec<FileInfoV2>,
}