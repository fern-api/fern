use crate::document_metadata::DocumentMetadata;
use crate::document_upload_result::DocumentUploadResult;
use serde::{Deserialize, Serialize};

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
