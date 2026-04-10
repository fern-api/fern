pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2V3TestCaseImplementationReferenceTypeType {
    #[serde(rename = "templateId")]
    TemplateId,
}
impl fmt::Display for V2V3TestCaseImplementationReferenceTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::TemplateId => "templateId",
        };
        write!(f, "{}", s)
    }
}
