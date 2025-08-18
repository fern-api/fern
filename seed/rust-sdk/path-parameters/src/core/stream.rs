use std::pin::Pin;
use std::task::{Context, Poll};
use futures::{Stream, StreamExt};
use reqwest::Response;
use tokio::io::{AsyncRead, ReadBuf};

/// Error type for file streaming operations
#[derive(Debug, thiserror::Error)]
pub enum StreamError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

/// A streaming wrapper for downloading large files
pub struct FileStream {
    inner: Pin<Box<dyn Stream<Item = Result<bytes::Bytes, reqwest::Error>> + Send>>,
    chunk_size: usize,
}

impl FileStream {
    /// Create a new FileStream from a reqwest Response
    pub fn new(response: Response) -> Self {
        Self {
            inner: Box::pin(response.bytes_stream()),
            chunk_size: 8192, // 8KB default chunk size
        }
    }

    /// Set the chunk size for reading (doesn't affect HTTP chunks)
    pub fn with_chunk_size(mut self, chunk_size: usize) -> Self {
        self.chunk_size = chunk_size;
        self
    }

    /// Add progress tracking to the stream
    pub fn with_progress<F>(self, callback: F) -> ProgressStream<F>
    where
        F: FnMut(usize) + Send + 'static + Unpin,
    {
        ProgressStream::new(self.inner, callback)
    }

    /// Collect all chunks into a single Vec<u8>
    pub async fn collect_bytes(mut self) -> Result<Vec<u8>, StreamError> {
        let mut bytes = Vec::new();
        while let Some(chunk) = self.next().await {
            bytes.extend_from_slice(&chunk?);
        }
        Ok(bytes)
    }

    /// Write the stream directly to a file
    pub async fn write_to_file<P: AsRef<std::path::Path>>(mut self, path: P) -> Result<(), StreamError> {
        use tokio::io::AsyncWriteExt;
        
        let mut file = tokio::fs::File::create(path).await?;
        while let Some(chunk) = self.next().await {
            file.write_all(&chunk?).await?;
        }
        file.flush().await?;
        Ok(())
    }
}

impl Stream for FileStream {
    type Item = Result<Vec<u8>, StreamError>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        match self.inner.as_mut().poll_next(cx) {
            Poll::Ready(Some(Ok(chunk))) => Poll::Ready(Some(Ok(chunk.to_vec()))),
            Poll::Ready(Some(Err(e))) => Poll::Ready(Some(Err(StreamError::Http(e)))),
            Poll::Ready(None) => Poll::Ready(None),
            Poll::Pending => Poll::Pending,
        }
    }
}

/// A stream wrapper that tracks download progress
pub struct ProgressStream<F> {
    inner: Pin<Box<dyn Stream<Item = Result<bytes::Bytes, reqwest::Error>> + Send>>,
    callback: F,
    total_bytes: usize,
}

impl<F> Unpin for ProgressStream<F> where F: Unpin {}

impl<F> ProgressStream<F>
where
    F: FnMut(usize) + Send + 'static + Unpin,
{
    pub fn new(
        inner: Pin<Box<dyn Stream<Item = Result<bytes::Bytes, reqwest::Error>> + Send>>,
        callback: F,
    ) -> Self {
        Self {
            inner,
            callback,
            total_bytes: 0,
        }
    }

    /// Get the total number of bytes downloaded so far
    pub fn total_bytes(&self) -> usize {
        self.total_bytes
    }

    /// Write the stream directly to a file with progress tracking
    pub async fn write_to_file<P: AsRef<std::path::Path>>(self, path: P) -> Result<(), StreamError> {
        use tokio::io::AsyncWriteExt;
        
        let mut file = tokio::fs::File::create(path).await?;
        let mut stream = self;
        
        loop {
            match futures::StreamExt::next(&mut stream).await {
                Some(chunk) => {
                    file.write_all(&chunk?).await?;
                }
                None => break,
            }
        }
        file.flush().await?;
        Ok(())
    }
}

impl<F> Stream for ProgressStream<F>
where
    F: FnMut(usize) + Send + 'static + Unpin,
{
    type Item = Result<Vec<u8>, StreamError>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let this = self.get_mut();
        match this.inner.as_mut().poll_next(cx) {
            Poll::Ready(Some(Ok(chunk))) => {
                this.total_bytes += chunk.len();
                (this.callback)(this.total_bytes);
                Poll::Ready(Some(Ok(chunk.to_vec())))
            }
            Poll::Ready(Some(Err(e))) => Poll::Ready(Some(Err(StreamError::Http(e)))),
            Poll::Ready(None) => Poll::Ready(None),
            Poll::Pending => Poll::Pending,
        }
    }
}

/// Synchronous iterator for file downloads (bridges async to sync)
pub struct FileSyncIterator {
    runtime: tokio::runtime::Handle,
    stream: Option<FileStream>,
    buffer: Vec<Result<Vec<u8>, StreamError>>,
    finished: bool,
}

impl FileSyncIterator {
    /// Create a new synchronous iterator from a FileStream
    pub fn new(stream: FileStream) -> Self {
        let runtime = tokio::runtime::Handle::try_current()
            .unwrap_or_else(|_| {
                // Create a new runtime if we're not in an async context
                tokio::runtime::Runtime::new()
                    .expect("Failed to create tokio runtime")
                    .handle()
                    .clone()
            });

        Self {
            runtime,
            stream: Some(stream),
            buffer: Vec::new(),
            finished: false,
        }
    }

    /// Collect all remaining chunks
    pub fn collect(mut self) -> Result<Vec<u8>, StreamError> {
        let mut result = Vec::new();
        for chunk in self {
            result.extend_from_slice(&chunk?);
        }
        Ok(result)
    }
}

impl Iterator for FileSyncIterator {
    type Item = Result<Vec<u8>, StreamError>;

    fn next(&mut self) -> Option<Self::Item> {
        if self.finished {
            return None;
        }

        // If we have buffered items, return them first
        if !self.buffer.is_empty() {
            return Some(self.buffer.remove(0));
        }

        // Try to get the next chunk from the async stream
        if let Some(mut stream) = self.stream.take() {
            match self.runtime.block_on(async {
                stream.next().await
            }) {
                Some(result) => {
                    self.stream = Some(stream);
                    Some(result)
                }
                None => {
                    self.finished = true;
                    None
                }
            }
        } else {
            self.finished = true;
            None
        }
    }
}

/// Helper function to create a simple file stream
pub fn create_file_stream(response: Response) -> FileStream {
    FileStream::new(response)
}

/// Helper function to download a file with progress tracking
pub async fn download_with_progress<F, P>(
    response: Response,
    output_path: P,
    mut progress_callback: F,
) -> Result<(), StreamError>
where
    F: FnMut(usize) + Send + 'static + Unpin,
    P: AsRef<std::path::Path>,
{
    let stream = FileStream::new(response).with_progress(move |bytes| {
        progress_callback(bytes);
    });

    stream.write_to_file(output_path).await
}