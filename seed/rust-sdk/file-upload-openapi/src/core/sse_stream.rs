use crate::ApiError;
use futures::Stream;
use pin_project::pin_project;
use reqwest::{header::CONTENT_TYPE, Response};
use reqwest_sse::{error::EventError, Event, EventSource};
use serde::de::DeserializeOwned;
use std::{
    marker::PhantomData,
    pin::Pin,
    task::{Context, Poll},
};

/// Metadata from a Server-Sent Event
///
/// Contains the SSE protocol fields (event, id, retry) that accompany the data payload.
/// This struct provides access to SSE metadata for advanced use cases.
///
/// Per the SSE specification:
/// - `event` defaults to "message" when not specified by the server
/// - `id` is optional and used for reconnection support (Last-Event-ID header)
/// - `retry` is optional and specifies reconnection timeout in milliseconds
#[derive(Debug, Clone)]
pub struct SseMetadata {
    /// The event type (defaults to "message" per SSE spec if not specified by server)
    pub event: String,
    /// The event ID for reconnection support (None if not specified)
    pub id: Option<String>,
    /// Retry timeout in milliseconds (None if not specified)
    pub retry: Option<u64>,
}

/// A Server-Sent Event with both data and metadata
///
/// Contains the deserialized data payload along with SSE protocol metadata.
/// Use this when you need access to event IDs, event types, or retry information.
#[derive(Debug)]
pub struct SseEvent<T> {
    /// The deserialized data payload
    pub data: T,
    /// SSE protocol metadata
    pub metadata: SseMetadata,
}

/// A type-safe wrapper around Server-Sent Events (SSE) streams
///
/// Leverages `reqwest-sse` for SSE protocol parsing and adds:
/// - Automatic JSON deserialization to typed structs
/// - Stream terminator support (e.g., `[DONE]` for OpenAI-style APIs)
/// - Integrated error handling with `ApiError`
/// - Content-Type validation (`text/event-stream` required)
///
/// # Charset Handling
///
/// The `reqwest-sse` library automatically handles charset detection and decoding
/// based on the Content-Type header. If no charset is specified, UTF-8 is assumed.
/// This matches the SSE specification default behavior.
///
/// # Example
///
/// Basic usage with async iteration:
///
/// ```no_run
/// use futures::StreamExt;
///
/// let stream: SseStream<CompletionChunk> = client.stream_completions(request).await?;
/// let mut stream = std::pin::pin!(stream);
///
/// while let Some(result) = stream.next().await {
///     match result {
///         Ok(chunk) => println!("Received: {:?}", chunk),
///         Err(e) => eprintln!("Error: {}", e),
///     }
/// }
/// ```
///
/// # Error Handling
///
/// The stream yields `Result<T, ApiError>` items. Errors can occur from:
/// - Invalid JSON in SSE data field (`ApiError::Serialization`)
/// - SSE protocol errors (`ApiError::SseParseError`)
/// - Network errors during streaming
///
/// **Important:** When an error occurs for a single event (e.g., malformed JSON),
/// the stream yields `Err` for that item but **continues streaming** subsequent events.
/// The stream only ends when:
/// - A terminator is received (if configured)
/// - The server closes the connection
/// - A fatal network error occurs
///
/// This allows the client to handle per-event errors gracefully without losing
/// the entire stream. Compare this to other error handling strategies where a single
/// bad event might terminate the stream.
///
/// # Terminator Support
///
/// When a terminator string is specified (e.g., `[DONE]`), the stream automatically
/// ends when an SSE event with that exact data is received. The terminator event
/// itself is not yielded to the consumer.
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
    ///
    /// # Errors
    /// Returns `ApiError::SseParseError` if:
    /// - Response Content-Type is not `text/event-stream`
    /// - SSE stream cannot be created from response
    pub(crate) async fn new(
        response: Response,
        terminator: Option<String>,
    ) -> Result<Self, ApiError> {
        // Validate Content-Type header (case-insensitive, handles parameters)
        let content_type = response
            .headers()
            .get(CONTENT_TYPE)
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        // Extract main content type (before ';' parameter separator) and compare case-insensitively
        let content_type_main = content_type.split(';').next().unwrap_or("").trim();

        if !content_type_main.eq_ignore_ascii_case("text/event-stream") {
            return Err(ApiError::SseParseError(format!(
                "Expected Content-Type to be 'text/event-stream', got '{}'",
                content_type
            )));
        }

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

impl<T> SseStream<T>
where
    T: DeserializeOwned,
{
    /// Convert this stream into one that yields events with metadata
    ///
    /// This consumes the stream and returns a new stream that yields `SseEvent<T>`
    /// instead of just `T`, providing access to SSE metadata (event type, id, retry).
    ///
    /// # Example
    ///
    /// ```no_run
    /// use futures::StreamExt;
    ///
    /// let stream = client.stream_completions(request).await?;
    /// let mut stream_with_metadata = stream.with_metadata();
    /// let mut stream_with_metadata = std::pin::pin!(stream_with_metadata);
    ///
    /// while let Some(result) = stream_with_metadata.next().await {
    ///     match result {
    ///         Ok(event) => {
    ///             println!("Data: {:?}", event.data);
    ///             println!("Event type: {}", event.metadata.event);
    ///             if let Some(id) = &event.metadata.id {
    ///                 println!("Event ID: {}", id);
    ///             }
    ///         }
    ///         Err(e) => eprintln!("Error: {}", e),
    ///     }
    /// }
    /// ```
    pub fn with_metadata(self) -> SseStreamWithMetadata<T> {
        SseStreamWithMetadata { inner: self }
    }
}

impl<T> Stream for SseStream<T>
where
    T: DeserializeOwned,
{
    type Item = Result<T, ApiError>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        use futures::StreamExt;
        let this = self.project();
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

/// Stream wrapper that yields events with metadata
///
/// Created by calling [`SseStream::with_metadata()`]. This stream yields `SseEvent<T>`
/// which includes both the deserialized data and SSE protocol metadata.
#[pin_project]
pub struct SseStreamWithMetadata<T> {
    #[pin]
    inner: SseStream<T>,
}

impl<T> Stream for SseStreamWithMetadata<T>
where
    T: DeserializeOwned,
{
    type Item = Result<SseEvent<T>, ApiError>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        use futures::StreamExt;
        let this = self.project();

        // Access the inner stream's fields through pin projection
        let inner_pin = this.inner.project();

        match inner_pin.inner.poll_next(cx) {
            Poll::Ready(Some(Ok(event))) => {
                // Check for terminator
                if let Some(ref terminator) = inner_pin.terminator {
                    if event.data == *terminator {
                        return Poll::Ready(None);
                    }
                }

                // Extract metadata
                let metadata = SseMetadata {
                    // Default to "message" if event type is empty (per SSE spec)
                    event: if event.event_type.is_empty() {
                        "message".to_string()
                    } else {
                        event.event_type.clone()
                    },
                    id: event.last_event_id.clone(),
                    retry: event.retry.map(|d| d.as_millis() as u64),
                };

                // Deserialize JSON data
                match serde_json::from_str(&event.data) {
                    Ok(data) => Poll::Ready(Some(Ok(SseEvent { data, metadata }))),
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
