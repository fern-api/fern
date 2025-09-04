use std::collections::VecDeque;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll};

use futures::Stream;
use serde_json::Value;

use crate::{ApiError, HttpClient};

/// Result of a pagination request
#[derive(Debug)]
pub struct PaginationResult<T> {
    pub items: Vec<T>,
    pub next_cursor: Option<String>,
    pub has_next_page: bool,
}

/// Async paginator that implements Stream for iterating over paginated results
pub struct AsyncPaginator<T> {
    http_client: Arc<HttpClient>,
    page_loader: Box<dyn Fn(Arc<HttpClient>, Option<String>) -> Pin<Box<dyn Future<Output = Result<PaginationResult<T>, ApiError>> + Send>> + Send + Sync>,
    current_page: VecDeque<T>,
    current_cursor: Option<String>,
    has_next_page: bool,
    loading_next: Option<Pin<Box<dyn Future<Output = Result<PaginationResult<T>, ApiError>> + Send>>>,
}

impl<T> AsyncPaginator<T> {
    pub fn new<F, Fut>(
        http_client: Arc<HttpClient>,
        page_loader: F,
        initial_cursor: Option<String>,
    ) -> Result<Self, ApiError>
    where
        F: Fn(Arc<HttpClient>, Option<String>) -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<PaginationResult<T>, ApiError>> + Send + 'static,
    {
        Ok(Self {
            http_client,
            page_loader: Box::new(move |client, cursor| Box::pin(page_loader(client, cursor))),
            current_page: VecDeque::new(),
            current_cursor: initial_cursor,
            has_next_page: true, // Assume true initially, will be updated after first request
            loading_next: None,
        })
    }

    /// Check if there are more pages available
    pub fn has_next_page(&self) -> bool {
        !self.current_page.is_empty() || self.has_next_page
    }

    /// Load the next page explicitly
    pub async fn next_page(&mut self) -> Result<Vec<T>, ApiError> {
        if !self.has_next_page {
            return Ok(Vec::new());
        }

        let result = (self.page_loader)(self.http_client.clone(), self.current_cursor.clone()).await?;
        
        self.current_cursor = result.next_cursor;
        self.has_next_page = result.has_next_page;
        
        Ok(result.items)
    }
}

impl<T> Stream for AsyncPaginator<T>
where
    T: Unpin,
{
    type Item = Result<T, ApiError>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        // If we have items in the current page, return the next one
        if let Some(item) = self.current_page.pop_front() {
            return Poll::Ready(Some(Ok(item)));
        }

        // If we're already loading the next page, poll that future
        if let Some(ref mut loading_future) = self.loading_next {
            match loading_future.as_mut().poll(cx) {
                Poll::Ready(Ok(result)) => {
                    self.current_page.extend(result.items);
                    self.current_cursor = result.next_cursor;
                    self.has_next_page = result.has_next_page;
                    self.loading_next = None;

                    // Try to get the next item from the newly loaded page
                    if let Some(item) = self.current_page.pop_front() {
                        return Poll::Ready(Some(Ok(item)));
                    } else if !self.has_next_page {
                        return Poll::Ready(None);
                    }
                    // Fall through to start loading next page
                }
                Poll::Ready(Err(e)) => {
                    self.loading_next = None;
                    return Poll::Ready(Some(Err(e)));
                }
                Poll::Pending => return Poll::Pending,
            }
        }

        // If we have no more pages to load, we're done
        if !self.has_next_page {
            return Poll::Ready(None);
        }

        // Start loading the next page
        let future = (self.page_loader)(self.http_client.clone(), self.current_cursor.clone());
        self.loading_next = Some(future);

        // Poll the future immediately
        if let Some(ref mut loading_future) = self.loading_next {
            match loading_future.as_mut().poll(cx) {
                Poll::Ready(Ok(result)) => {
                    self.current_page.extend(result.items);
                    self.current_cursor = result.next_cursor;
                    self.has_next_page = result.has_next_page;
                    self.loading_next = None;

                    if let Some(item) = self.current_page.pop_front() {
                        Poll::Ready(Some(Ok(item)))
                    } else if !self.has_next_page {
                        Poll::Ready(None)
                    } else {
                        // This shouldn't happen, but just in case
                        cx.waker().wake_by_ref();
                        Poll::Pending
                    }
                }
                Poll::Ready(Err(e)) => {
                    self.loading_next = None;
                    Poll::Ready(Some(Err(e)))
                }
                Poll::Pending => Poll::Pending,
            }
        } else {
            Poll::Pending
        }
    }
}

/// Synchronous paginator for blocking iteration
pub struct SyncPaginator<T> {
    http_client: Arc<HttpClient>,
    page_loader: Box<dyn Fn(Arc<HttpClient>, Option<String>) -> Result<PaginationResult<T>, ApiError> + Send + Sync>,
    current_page: VecDeque<T>,
    current_cursor: Option<String>,
    has_next_page: bool,
}

impl<T> SyncPaginator<T> {
    pub fn new<F>(
        http_client: Arc<HttpClient>,
        page_loader: F,
        initial_cursor: Option<String>,
    ) -> Result<Self, ApiError>
    where
        F: Fn(Arc<HttpClient>, Option<String>) -> Result<PaginationResult<T>, ApiError> + Send + Sync + 'static,
    {
        Ok(Self {
            http_client,
            page_loader: Box::new(page_loader),
            current_page: VecDeque::new(),
            current_cursor: initial_cursor,
            has_next_page: true, // Assume true initially
        })
    }

    /// Check if there are more pages available
    pub fn has_next_page(&self) -> bool {
        !self.current_page.is_empty() || self.has_next_page
    }

    /// Load the next page explicitly
    pub fn next_page(&mut self) -> Result<Vec<T>, ApiError> {
        if !self.has_next_page {
            return Ok(Vec::new());
        }

        let result = (self.page_loader)(self.http_client.clone(), self.current_cursor.clone())?;
        
        self.current_cursor = result.next_cursor;
        self.has_next_page = result.has_next_page;
        
        Ok(result.items)
    }

    /// Get all remaining items by loading all pages
    pub fn collect_all(&mut self) -> Result<Vec<T>, ApiError> {
        let mut all_items = Vec::new();
        
        // Add items from current page
        while let Some(item) = self.current_page.pop_front() {
            all_items.push(item);
        }
        
        // Load all remaining pages
        while self.has_next_page {
            let page_items = self.next_page()?;
            all_items.extend(page_items);
        }
        
        Ok(all_items)
    }
}

impl<T> Iterator for SyncPaginator<T> {
    type Item = Result<T, ApiError>;

    fn next(&mut self) -> Option<Self::Item> {
        // If we have items in the current page, return the next one
        if let Some(item) = self.current_page.pop_front() {
            return Some(Ok(item));
        }

        // If we have no more pages to load, we're done
        if !self.has_next_page {
            return None;
        }

        // Load the next page
        match (self.page_loader)(self.http_client.clone(), self.current_cursor.clone()) {
            Ok(result) => {
                self.current_page.extend(result.items);
                self.current_cursor = result.next_cursor;
                self.has_next_page = result.has_next_page;

                // Return the first item from the newly loaded page
                self.current_page.pop_front().map(Ok)
            }
            Err(e) => Some(Err(e)),
        }
    }
}

/// Trait for types that can provide pagination metadata
pub trait Paginated<T> {
    /// Extract the items from this page
    fn items(&self) -> &[T];
    
    /// Get the cursor for the next page, if any
    fn next_cursor(&self) -> Option<&str>;
    
    /// Check if there's a next page available
    fn has_next_page(&self) -> bool;
}

/// Trait for types that can provide offset-based pagination metadata
pub trait OffsetPaginated<T> {
    /// Extract the items from this page
    fn items(&self) -> &[T];
    
    /// Check if there's a next page available
    fn has_next_page(&self) -> bool;
    
    /// Get the current page size (for calculating next offset)
    fn page_size(&self) -> usize {
        self.items().len()
    }
}