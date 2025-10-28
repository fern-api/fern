use crate::ApiError;
use futures::Stream;
use pin_project::pin_project;
use reqwest::Response;
use reqwest_sse::{error::EventError, Event, EventSource};
use serde::de::DeserializeOwned;
use std::{
    marker::PhantomData,
    pin::Pin,
    task::{Context, Poll},
};

/// A type-safe wrapper around Server-Sent Events (SSE) streams
///
/// Leverages `reqwest-sse` for SSE protocol parsing and adds:
/// - Automatic JSON deserialization to typed structs
/// - Stream terminator support (e.g., `[DONE]` for OpenAI-style APIs)
/// - Integrated error handling with `ApiError`
///
/// # Example
/// ```no_run
/// use futures::StreamExt;
///
/// let stream: SseStream<CompletionChunk> = client.stream_completions(request).await?;
/// let mut stream = std::pin::pin!(stream);
///
/// while let Some(chunk) = stream.next().await {
///     let chunk = chunk?;
///     println!("Received: {:?}", chunk);
/// }
/// ```
#[pin_project]
pub struct SseStream<T> {
    #[pin]
    inner: Pin<Box<dyn Stream<Item = Result<Event, EventError>> + Send>>,
    terminator: Option<String>,
    _phantom: PhantomData<T>,
}

impl<T> SseStream<T>
where
    T: DeserializeOwned,
{
    /// Create a new SSE stream from a Response
    ///
    /// # Arguments
    /// * `response` - The HTTP response to parse as SSE
    /// * `terminator` - Optional terminator string (e.g., `"[DONE]"`) that signals end of stream
    pub(crate) async fn new(
        response: Response,
        terminator: Option<String>,
    ) -> Result<Self, ApiError> {
        // Use reqwest-sse's EventSource trait to get SSE stream
        let events = response
            .events()
            .await
            .map_err(|e| ApiError::SseParseError(e.to_string()))?;

        Ok(Self {
            inner: Box::pin(events),
            terminator,
            _phantom: PhantomData,
        })
    }
}

impl<T> Stream for SseStream<T>
where
    T: DeserializeOwned,
{
    type Item = Result<T, ApiError>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let this = self.project();
        use futures::StreamExt;
        match this.inner.poll_next(cx) {
            Poll::Ready(Some(Ok(event))) => {
                // Check for terminator before parsing
                if let Some(ref terminator) = this.terminator {
                    if event.data == *terminator {
                        // Terminator found - end stream cleanly
                        return Poll::Ready(None);
                    }
                }

                // Deserialize JSON data to typed struct
                match serde_json::from_str(&event.data) {
                    Ok(value) => Poll::Ready(Some(Ok(value))),
                    Err(e) => Poll::Ready(Some(Err(ApiError::Serialization(e)))),
                }
            }
            Poll::Ready(Some(Err(e))) => {
                Poll::Ready(Some(Err(ApiError::SseParseError(e.to_string()))))
            }
            Poll::Ready(None) => Poll::Ready(None),
            Poll::Pending => Poll::Pending,
        }
    }
}
