use std::path::Path;

/// A file type suitable for file uploads with optional metadata.
#[derive(Debug, Clone)]
pub struct File {
    /// The raw file data as bytes
    pub data: Vec<u8>,
    /// Optional filename for the file
    pub filename: Option<String>,
}

impl File {
    /// Create a new File with just data
    pub fn new(data: Vec<u8>) -> Self {
        Self {
            data,
            filename: None,
        }
    }

    /// Set the filename for this file
    pub fn with_filename<S: Into<String>>(mut self, filename: S) -> Self {
        self.filename = Some(filename.into());
        self
    }

    /// Create a File from a filesystem path
    pub fn from_path<P: AsRef<Path>>(path: P) -> std::io::Result<Self> {
        let path = path.as_ref();
        let data = std::fs::read(path)?;
        let filename = path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|s| s.to_string());

        Ok(Self {
            data,
            filename,
        })
    }

    /// Get the content type for this file based on filename extension
    pub fn get_content_type(&self) -> &'static str {
        if let Some(filename) = &self.filename {
            let extension = std::path::Path::new(filename)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("");

            match extension.to_lowercase().as_str() {
                "jpg" | "jpeg" => "image/jpeg",
                "png" => "image/png",
                "gif" => "image/gif",
                "pdf" => "application/pdf",
                "txt" => "text/plain",
                "json" => "application/json",
                "zip" => "application/zip",
                "mp4" => "video/mp4",
                "mp3" => "audio/mpeg",
                _ => "application/octet-stream",
            }
        } else {
            "application/octet-stream"
        }
    }

    /// Get the size of the file in bytes
    pub fn size(&self) -> usize {
        self.data.len()
    }

    /// Check if the file is empty
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
}

impl From<Vec<u8>> for File {
    fn from(data: Vec<u8>) -> Self {
        Self::new(data)
    }
}

impl From<&[u8]> for File {
    fn from(data: &[u8]) -> Self {
        Self::new(data.to_vec())
    }
}

impl AsRef<[u8]> for File {
    fn as_ref(&self) -> &[u8] {
        &self.data
    }
}