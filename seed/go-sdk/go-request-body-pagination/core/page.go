package core

import (
	"context"
	"errors"
	"net/http"
)

// ErrNoPages is a sentinel error used to signal that no pages remain.
//
// This error should be used similar to io.EOF, such that it represents
// a non-actionable error.
var ErrNoPages = errors.New("no pages remain")

// PageRequest represents the information required to identify a single page.
type PageRequest[Cursor comparable] struct {
	Cursor Cursor

	// Holds the value of the response type (populated by the *Caller).
	Response any
}

// PageResponse represents the information associated with a single page.
//
// Type parameters:
//   - Cursor: the type used for pagination (e.g., string cursor or integer offset)
//   - T: the type of individual items in the page
//   - R: the response type returned by the paginated endpoint
type PageResponse[Cursor comparable, T any, R any] struct {
	Results  []T
	Response R
	Next     Cursor
	Done     bool
}

// Page represents a single page of results.
type Page[Cursor comparable, T any, R any] struct {
	Results      []T
	Response     R
	RawResponse  PageResponse[Cursor, T, R]
	StatusCode   int
	Header       http.Header
	NextPageFunc func(context.Context) (*Page[Cursor, T, R], error)
}

// GetNextPage fetches the next page, if any. If no pages remain,
// the ErrNoPages error is returned.
func (p *Page[Cursor, T, R]) GetNextPage(ctx context.Context) (*Page[Cursor, T, R], error) {
	return p.NextPageFunc(ctx)
}

// Iterator returns an iterator that starts at the current page.
func (p *Page[Cursor, T, R]) Iterator() *PageIterator[Cursor, T, R] {
	return &PageIterator[Cursor, T, R]{
		page: p,
	}
}

// PageIterator is an auto-iterator for paginated endpoints.
type PageIterator[Cursor comparable, T any, R any] struct {
	page    *Page[Cursor, T, R]
	current T
	index   int
	err     error
}

// Next returns true if the given iterator has more results,
// fetching the next page as needed.
func (p *PageIterator[Cursor, T, R]) Next(ctx context.Context) bool {
	if p.page == nil || len(p.page.Results) == 0 {
		return false
	}
	if p.index >= len(p.page.Results) {
		p.index = 0
		p.page, p.err = p.page.GetNextPage(ctx)
		if p.err != nil || p.page == nil || len(p.page.Results) == 0 {
			return false
		}
	}
	p.current = p.page.Results[p.index]
	p.index += 1
	return true
}

// Current returns the current element.
func (p *PageIterator[Cursor, T, R]) Current() T {
	return p.current
}

// Err returns a non-nil error if the iterator encountered an error.
func (p *PageIterator[Cursor, T, R]) Err() error {
	if errors.Is(p.err, ErrNoPages) {
		return nil
	}
	return p.err
}
