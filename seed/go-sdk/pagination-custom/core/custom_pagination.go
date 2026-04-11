package core

import (
	"context"
	"errors"
)

type CustomPaginatedLink interface {
	GetRel() string
	GetMethod() string
	GetHref() string
}

// CustomPaginatedResponse is an interface that all paginated response types must implement.
// This allows different concrete types with different Data and Links types to be used with PayrocPager.
// D is the type of the Data field (e.g., []*SecureTokenWithAccountType)
// L is the concrete link type (e.g., *Link) that implements CustomPaginatedLink
type CustomPaginatedResponse[D any, L CustomPaginatedLink] interface {
	comparable // Allows nil comparison
	GetLimit() *int
	GetCount() *int
	GetHasMore() *bool
	GetLinks() []L
	GetData() D
}

// PageFetcher is a function that fetches a paginated response from a given URL.
// It should make an HTTP request to the href URL and return the parsed response.
type PageFetcher[T CustomPaginatedResponse[D, L], D any, L CustomPaginatedLink] func(ctx context.Context, href string) (T, error)

// PayrocPager is a generic pager for custom pagination endpoints.
// It provides bidirectional navigation through pages of results.
// T should be a pointer type (e.g., *SomeResponseType) that implements CustomPaginatedResponse[D, L].
// D is the type of the data slice (e.g., []*SecureTokenWithAccountType).
// L is the concrete link type (e.g., *Link) that implements CustomPaginatedLink.
type PayrocPager[T CustomPaginatedResponse[D, L], D any, L CustomPaginatedLink] struct {
	current T
	fetcher PageFetcher[T, D, L]
}

// NewPayrocPager creates a new custom pager with the given initial response
// and a fetcher function to retrieve additional pages.
func NewPayrocPager[T CustomPaginatedResponse[D, L], D any, L CustomPaginatedLink](
	initial T,
	fetcher PageFetcher[T, D, L],
) *PayrocPager[T, D, L] {
	return &PayrocPager[T, D, L]{
		current: initial,
		fetcher: fetcher,
	}
}

// HasNextPage returns true if there is a next page available.
// It checks both the hasMore field and the presence of a "next" link.
func (p *PayrocPager[T, D, L]) HasNextPage() bool {
	// First check the hasMore field if available
	if hasMore := p.current.GetHasMore(); hasMore != nil && *hasMore {
		return true
	}

	// Also check for a "next" link
	links := p.current.GetLinks()
	for _, link := range links {
		if link.GetRel() == "next" {
			return true
		}
	}

	return false
}

// GetNextPage fetches the next page of results.
// It finds the "next" link and uses the fetcher to retrieve the page.
func (p *PayrocPager[T, D, L]) GetNextPage(ctx context.Context) (T, error) {
	var zero T
	if p.fetcher == nil {
		return zero, errors.New("pager fetcher not configured")
	}

	links := p.current.GetLinks()
	var nextHref string
	for _, link := range links {
		if link.GetRel() == "next" {
			nextHref = link.GetHref()
			break
		}
	}

	if nextHref == "" {
		return zero, errors.New("no next page available")
	}

	nextPage, err := p.fetcher(ctx, nextHref)
	if err != nil {
		return zero, err
	}

	p.current = nextPage
	return nextPage, nil
}

// HasPrevPage returns true if there is a previous page available.
// It checks for the presence of a "previous" link.
func (p *PayrocPager[T, D, L]) HasPrevPage() bool {
	links := p.current.GetLinks()
	for _, link := range links {
		if link.GetRel() == "previous" {
			return true
		}
	}

	return false
}

// GetPrevPage fetches the previous page of results.
// It finds the "previous" link and uses the fetcher to retrieve the page.
func (p *PayrocPager[T, D, L]) GetPrevPage(ctx context.Context) (T, error) {
	var zero T
	if p.fetcher == nil {
		return zero, errors.New("pager fetcher not configured")
	}

	links := p.current.GetLinks()
	var prevHref string
	for _, link := range links {
		if link.GetRel() == "previous" {
			prevHref = link.GetHref()
			break
		}
	}

	if prevHref == "" {
		return zero, errors.New("no previous page available")
	}

	prevPage, err := p.fetcher(ctx, prevHref)
	if err != nil {
		return zero, err
	}

	p.current = prevPage
	return prevPage, nil
}

// Current returns the current page response.
func (p *PayrocPager[T, D, L]) Current() T {
	return p.current
}

// Iter returns a channel-based iterator for iterating through pages.
// This works with all Go versions and can be used with range loops.
// The iterator will yield the current page and continue fetching next pages
// until no more pages are available or the context is cancelled.
func (p *PayrocPager[T, D, L]) Iter(ctx context.Context) <-chan T {
	ch := make(chan T)
	go func() {
		defer close(ch)
		current := p.current
		for {
			select {
			case <-ctx.Done():
				return
			case ch <- current:
			}
			if !p.HasNextPage() {
				return
			}
			next, err := p.GetNextPage(ctx)
			if err != nil {
				return
			}
			current = next
		}
	}()
	return ch
}

// Seq returns a range-over-func iterator for Go 1.23+ compatibility.
// This allows using the pager with range loops: for page := range pager.Seq(ctx) { ... }
// The iterator will yield the current page and continue fetching next pages
// until no more pages are available or the context is cancelled.
func (p *PayrocPager[T, D, L]) Seq(ctx context.Context) func(yield func(T) bool) {
	return func(yield func(T) bool) {
		current := p.current
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}
			if !yield(current) {
				return
			}
			if !p.HasNextPage() {
				return
			}
			next, err := p.GetNextPage(ctx)
			if err != nil {
				return
			}
			current = next
		}
	}
}

// ForEach iterates through all pages and calls the provided function for each page.
// If the function returns false, iteration stops early.
func (p *PayrocPager[T, D, L]) ForEach(ctx context.Context, fn func(T) bool) {
	current := p.current
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}
		if !fn(current) {
			return
		}
		if !p.HasNextPage() {
			return
		}
		next, err := p.GetNextPage(ctx)
		if err != nil {
			return
		}
		current = next
	}
}
