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
    page_loader: Box<
        dyn Fn(
                Arc<HttpClient>,
                Option<String>,
            )
                -> Pin<Box<dyn Future<Output = Result<PaginationResult<T>, ApiError>> + Send>>
            + Send
            + Sync,
    >,
    current_page: VecDeque<T>,
    current_cursor: Option<String>,
    has_next_page: bool,
    loading_next:
        Option<Pin<Box<dyn Future<Output = Result<PaginationResult<T>, ApiError>> + Send>>>,
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

        let result =
            (self.page_loader)(self.http_client.clone(), self.current_cursor.clone()).await?;

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
    page_loader: Box<
        dyn Fn(Arc<HttpClient>, Option<String>) -> Result<PaginationResult<T>, ApiError>
            + Send
            + Sync,
    >,
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
        F: Fn(Arc<HttpClient>, Option<String>) -> Result<PaginationResult<T>, ApiError>
            + Send
            + Sync
            + 'static,
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ClientConfig;

    fn make_http_client() -> Arc<HttpClient> {
        Arc::new(HttpClient::new(ClientConfig::default()).expect("Failed to create test HttpClient"))
    }

    // ===========================
    // SyncPaginator tests
    // ===========================

    #[test]
    fn test_sync_paginator_has_next_page_initially() {
        let client = make_http_client();
        let paginator = SyncPaginator::<String>::new(client, |_client, _cursor| {
            Ok(PaginationResult {
                items: vec![],
                next_cursor: None,
                has_next_page: false,
            })
        }, None).unwrap();
        assert!(paginator.has_next_page());
    }

    #[test]
    fn test_sync_paginator_single_page() {
        let client = make_http_client();
        let mut paginator = SyncPaginator::new(client, |_client, _cursor| {
            Ok(PaginationResult {
                items: vec!["a".to_string(), "b".to_string()],
                next_cursor: None,
                has_next_page: false,
            })
        }, None).unwrap();

        let page = paginator.next_page().unwrap();
        assert_eq!(page, vec!["a".to_string(), "b".to_string()]);
        assert!(!paginator.has_next_page());
    }

    #[test]
    fn test_sync_paginator_exhausted_returns_empty() {
        let client = make_http_client();
        let mut paginator = SyncPaginator::new(client, |_client, _cursor| {
            Ok(PaginationResult {
                items: vec!["a".to_string()],
                next_cursor: None,
                has_next_page: false,
            })
        }, None).unwrap();

        let _ = paginator.next_page().unwrap();
        let empty = paginator.next_page().unwrap();
        assert!(empty.is_empty());
    }

    #[test]
    fn test_sync_paginator_multiple_pages() {
        let client = make_http_client();
        let call_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let count = call_count.clone();

        let mut paginator = SyncPaginator::new(client, move |_client, cursor| {
            let call = count.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            match call {
                0 => {
                    assert!(cursor.is_none());
                    Ok(PaginationResult {
                        items: vec![1, 2],
                        next_cursor: Some("page2".to_string()),
                        has_next_page: true,
                    })
                }
                1 => {
                    assert_eq!(cursor, Some("page2".to_string()));
                    Ok(PaginationResult {
                        items: vec![3, 4],
                        next_cursor: None,
                        has_next_page: false,
                    })
                }
                _ => panic!("Unexpected call"),
            }
        }, None).unwrap();

        let page1 = paginator.next_page().unwrap();
        assert_eq!(page1, vec![1, 2]);
        assert!(paginator.has_next_page());

        let page2 = paginator.next_page().unwrap();
        assert_eq!(page2, vec![3, 4]);
        assert!(!paginator.has_next_page());
    }

    #[test]
    fn test_sync_paginator_collect_all() {
        let client = make_http_client();
        let call_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let count = call_count.clone();

        let mut paginator = SyncPaginator::new(client, move |_client, _cursor| {
            let call = count.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            match call {
                0 => Ok(PaginationResult {
                    items: vec![1, 2],
                    next_cursor: Some("next".to_string()),
                    has_next_page: true,
                }),
                1 => Ok(PaginationResult {
                    items: vec![3],
                    next_cursor: None,
                    has_next_page: false,
                }),
                _ => panic!("Unexpected call"),
            }
        }, None).unwrap();

        let all = paginator.collect_all().unwrap();
        assert_eq!(all, vec![1, 2, 3]);
    }

    #[test]
    fn test_sync_paginator_iterator() {
        let client = make_http_client();
        let call_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let count = call_count.clone();

        let paginator = SyncPaginator::new(client, move |_client, _cursor| {
            let call = count.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            match call {
                0 => Ok(PaginationResult {
                    items: vec![10, 20],
                    next_cursor: Some("p2".to_string()),
                    has_next_page: true,
                }),
                1 => Ok(PaginationResult {
                    items: vec![30],
                    next_cursor: None,
                    has_next_page: false,
                }),
                _ => panic!("Unexpected call"),
            }
        }, None).unwrap();

        let items: Vec<i32> = paginator.map(|r| r.unwrap()).collect();
        assert_eq!(items, vec![10, 20, 30]);
    }

    #[test]
    fn test_sync_paginator_error_propagation() {
        let client = make_http_client();
        let mut paginator = SyncPaginator::<String>::new(client, |_client, _cursor| {
            Err(ApiError::Serialization("test error".to_string()))
        }, None).unwrap();

        let result = paginator.next_page();
        assert!(result.is_err());
    }

    #[test]
    fn test_sync_paginator_iterator_error() {
        let client = make_http_client();
        let mut paginator = SyncPaginator::<String>::new(client, |_client, _cursor| {
            Err(ApiError::Serialization("test error".to_string()))
        }, None).unwrap();

        let item = paginator.next();
        assert!(item.is_some());
        assert!(item.unwrap().is_err());
    }

    #[test]
    fn test_sync_paginator_with_initial_cursor() {
        let client = make_http_client();
        let mut paginator = SyncPaginator::new(client, |_client, cursor| {
            assert_eq!(cursor, Some("start_here".to_string()));
            Ok(PaginationResult {
                items: vec!["item".to_string()],
                next_cursor: None,
                has_next_page: false,
            })
        }, Some("start_here".to_string())).unwrap();

        let page = paginator.next_page().unwrap();
        assert_eq!(page, vec!["item".to_string()]);
    }

    // ===========================
    // PaginationResult tests
    // ===========================

    #[test]
    fn test_pagination_result_fields() {
        let result = PaginationResult {
            items: vec![1, 2, 3],
            next_cursor: Some("abc".to_string()),
            has_next_page: true,
        };
        assert_eq!(result.items.len(), 3);
        assert_eq!(result.next_cursor, Some("abc".to_string()));
        assert!(result.has_next_page);
    }

    // ===========================
    // Trait tests
    // ===========================

    struct MockPage {
        data: Vec<String>,
        cursor: Option<String>,
        has_more: bool,
    }

    impl Paginated<String> for MockPage {
        fn items(&self) -> &[String] {
            &self.data
        }
        fn next_cursor(&self) -> Option<&str> {
            self.cursor.as_deref()
        }
        fn has_next_page(&self) -> bool {
            self.has_more
        }
    }

    impl OffsetPaginated<String> for MockPage {
        fn items(&self) -> &[String] {
            &self.data
        }
        fn has_next_page(&self) -> bool {
            self.has_more
        }
    }

    #[test]
    fn test_paginated_trait() {
        let page = MockPage {
            data: vec!["a".to_string(), "b".to_string()],
            cursor: Some("next".to_string()),
            has_more: true,
        };
        assert_eq!(Paginated::items(&page).len(), 2);
        assert_eq!(page.next_cursor(), Some("next"));
        assert!(Paginated::has_next_page(&page));
    }

    #[test]
    fn test_offset_paginated_default_page_size() {
        let page = MockPage {
            data: vec!["a".to_string(), "b".to_string(), "c".to_string()],
            cursor: None,
            has_more: false,
        };
        assert_eq!(OffsetPaginated::page_size(&page), 3);
    }
}
