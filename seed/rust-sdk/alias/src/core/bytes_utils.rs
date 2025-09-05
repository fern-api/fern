use crate::ApiError;
use std::fs::File;
use std::io::{Read, Result as IoResult};

/// Trait for types that can be converted to bytes for HTTP requests
pub trait IntoBytes {
    /// Convert the input into a Vec<u8> for use in HTTP request bodies
    fn into_bytes(self) -> Result<Vec<u8>, ApiError>;
}

impl IntoBytes for Vec<u8> {
    fn into_bytes(self) -> Result<Vec<u8>, ApiError> {
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if self.len() > MAX_SIZE {
            return Err(ApiError::FileTooLarge(self.len() as u64));
        }
        Ok(self)
    }
}

impl IntoBytes for File {
    fn into_bytes(mut self) -> Result<Vec<u8>, ApiError> {
        let mut buffer = Vec::new();
        self.read_to_end(&mut buffer)
            .map_err(ApiError::FileUploadError)?;

        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if buffer.len() > MAX_SIZE {
            return Err(ApiError::FileTooLarge(buffer.len() as u64));
        }

        Ok(buffer)
    }
}

impl IntoBytes for Box<dyn Read + Send> {
    fn into_bytes(mut self) -> Result<Vec<u8>, ApiError> {
        let mut buffer = Vec::new();
        self.read_to_end(&mut buffer)
            .map_err(ApiError::FileUploadError)?;

        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if buffer.len() > MAX_SIZE {
            return Err(ApiError::FileTooLarge(buffer.len() as u64));
        }

        Ok(buffer)
    }
}

impl IntoBytes for &[u8] {
    fn into_bytes(self) -> Result<Vec<u8>, ApiError> {
        let bytes = self.to_vec();
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if bytes.len() > MAX_SIZE {
            return Err(ApiError::FileTooLarge(bytes.len() as u64));
        }
        Ok(bytes)
    }
}

impl IntoBytes for &str {
    fn into_bytes(self) -> Result<Vec<u8>, ApiError> {
        let bytes = self.as_bytes().to_vec();
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if bytes.len() > MAX_SIZE {
            return Err(ApiError::FileTooLarge(bytes.len() as u64));
        }
        Ok(bytes)
    }
}

/// Prepare bytes body for HTTP request
///
/// This function accepts various input types and converts them to Vec<u8>
/// for use in HTTP request bodies. Supported types include:
/// - Vec<u8>: Direct bytes
/// - File: Reads file contents
/// - Box<dyn Read + Send>: Reads from any Read implementation
/// - &[u8], &str: Converts to owned bytes
///
/// # Errors
/// - Returns `ApiError::FileUploadError` for I/O errors
/// - Returns `ApiError::FileTooLarge` if file exceeds 100MB limit
/// - Returns `ApiError::InvalidFileData` for invalid data
pub fn prepare_bytes_body<T: IntoBytes>(input: T) -> Result<Vec<u8>, ApiError> {
    let bytes = input.into_bytes()?;

    // Validate that we have some content for file uploads
    if bytes.is_empty() {
        return Err(ApiError::InvalidFileData);
    }

    Ok(bytes)
}
