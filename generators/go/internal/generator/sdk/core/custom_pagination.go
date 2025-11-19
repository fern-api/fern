package core

import (
	"context"
)

type CustomPager[T any] struct {
	current  *T
	hasNext  func(*T) bool
	hasPrev  func(*T) bool
	getNext  func(context.Context, *T) (*T, error)
	getPrev  func(context.Context, *T) (*T, error)
}

func NewCustomPager[T any](
	initial *T,
	hasNext func(*T) bool,
	hasPrev func(*T) bool,
	getNext func(context.Context, *T) (*T, error),
	getPrev func(context.Context, *T) (*T, error),
) *CustomPager[T] {
	return &CustomPager[T]{
		current: initial,
		hasNext: hasNext,
		hasPrev: hasPrev,
		getNext: getNext,
		getPrev: getPrev,
	}
}

func (p *CustomPager[T]) HasNextPage() bool {
	if p.current == nil || p.hasNext == nil {
		return false
	}
	return p.hasNext(p.current)
}

// GetNextPage fetches the next page of results.
func (p *CustomPager[T]) GetNextPage(ctx context.Context) (*T, error) {
	if p.getNext == nil {
		return nil, ErrNoPages
	}
	next, err := p.getNext(ctx, p.current)
	if err != nil {
		return nil, err
	}
	p.current = next
	return next, nil
}

func (p *CustomPager[T]) HasPrevPage() bool {
	if p.current == nil || p.hasPrev == nil {
		return false
	}
	return p.hasPrev(p.current)
}

func (p *CustomPager[T]) GetPrevPage(ctx context.Context) (*T, error) {
	if p.getPrev == nil {
		return nil, ErrNoPages
	}
	prev, err := p.getPrev(ctx, p.current)
	if err != nil {
		return nil, err
	}
	p.current = prev
	return prev, nil
}

func (p *CustomPager[T]) Current() *T {
	return p.current
}
