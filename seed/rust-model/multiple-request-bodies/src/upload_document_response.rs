pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum UploadDocumentResponse {
        DocumentMetadata(DocumentMetadata),

        DocumentUploadResult(DocumentUploadResult),
}

impl UploadDocumentResponse {
    pub fn is_documentmetadata(&self) -> bool {
        matches!(self, Self::DocumentMetadata(_))
    }

    pub fn is_documentuploadresult(&self) -> bool {
        matches!(self, Self::DocumentUploadResult(_))
    }


    pub fn as_documentmetadata(&self) -> Option<&DocumentMetadata> {
        match self {
                    Self::DocumentMetadata(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_documentmetadata(self) -> Option<DocumentMetadata> {
        match self {
                    Self::DocumentMetadata(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_documentuploadresult(&self) -> Option<&DocumentUploadResult> {
        match self {
                    Self::DocumentUploadResult(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_documentuploadresult(self) -> Option<DocumentUploadResult> {
        match self {
                    Self::DocumentUploadResult(value) => Some(value),
                    _ => None,
                }
    }

}

impl fmt::Display for UploadDocumentResponse {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DocumentMetadata(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::DocumentUploadResult(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
