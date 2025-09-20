use crate::commons_variable_type::VariableType;
use crate::v_2_problem_file_info_v_2::FileInfoV2;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DefaultProvidedFile {
    pub file: FileInfoV2,
    #[serde(rename = "relatedTypes")]
    pub related_types: Vec<VariableType>,
}
