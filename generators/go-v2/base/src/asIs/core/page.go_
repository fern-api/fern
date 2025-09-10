package core

import (
	"context"
	"errors"
)

// ErrNoPages is a sentinel error used to signal that no pages remain.
//
// This error should be used similar to io.EOF, such that it represents
// a non-actionable error.
var ErrNoPages = errors.New("no pages remain")

// Page represents a single page of results.
type Page[T any] struct {
	Results      []T
	NextPageFunc func(context.Context) (*Page[T], error)
}

// GetNextPage fetches the next page, if any. If no pages remain,
// the ErrNoPages error is returned.
func (p *Page[T]) GetNextPage(ctx context.Context) (*Page[T], error) {
	return p.NextPageFunc(ctx)
}

// Iterator returns an iterator that starts at the current page.
func (p *Page[T]) Iterator() *PageIterator[T] {
	return &PageIterator[T]{
		page: p,
	}
}

// PageIterator is an auto-iterator for paginated endpoints.
type PageIterator[T any] struct {
	page    *Page[T]
	current T
	index   int
	err     error
}

// Next returns true if the given iterator has more results,
// fetching the next page as needed.
func (p *PageIterator[T]) Next(ctx context.Context) bool {
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
func (p *PageIterator[T]) Current() T {
	return p.current
}

// Err returns a non-nil error if the iterator encountered an error.
func (p *PageIterator[T]) Err() error {
	if errors.Is(p.err, ErrNoPages) {
		return nil
	}
	return p.err
}
