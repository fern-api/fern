package internal

import (
	"context"

	"github.com/pagination/fern/core"
)

// PagerMode represents the different types of pagination modes.
type PagerMode uint

// The available set of pagination modes.
const (
	PagerModeCursor PagerMode = iota + 1
	PagerModeOffset
)

// Pager is the primary abstraction used to call paginated APIs.
type Pager[
	Cursor comparable,
	Response any,
	Results any,
] struct {
	mode             PagerMode
	caller           *Caller
	prepareCall      PageRequestFunc[Cursor]
	readPageResponse PageResponseFunc[Cursor, Response, Results]
}

// PageRequest represents the information required to identify a single page.
type PageRequest[Cursor comparable] struct {
	Cursor Cursor

	// Holds the value of the response type (populated by the *Caller).
	Response any
}

// PageResponse represents the information associated with a single page.
type PageResponse[Cursor comparable, Result any] struct {
	Results []Result
	Next    Cursor
	Done    bool
}

// PageRequestFunc prepares the *CallParams from the given page request.
type PageRequestFunc[Cursor comparable] func(request *PageRequest[Cursor]) *CallParams

// PageResponseFunc extracts the next page information from the response.
type PageResponseFunc[
	Cursor comparable,
	Response any,
	Results any,
] func(Response) *PageResponse[Cursor, Results]

// NewCursorPager constructs a new Pager that fetches pages from a paginated endpoint.
func NewCursorPager[Cursor comparable, Response any, Results any](
	caller *Caller,
	prepareCall PageRequestFunc[Cursor],
	readPageResponse PageResponseFunc[Cursor, Response, Results],
) *Pager[Cursor, Response, Results] {
	return &Pager[Cursor, Response, Results]{
		mode:             PagerModeCursor,
		caller:           caller,
		prepareCall:      prepareCall,
		readPageResponse: readPageResponse,
	}
}

// NewOffsetPager constructs a new Pager that fetches pages from an offset paginated endpoint.
func NewOffsetPager[Cursor comparable, Response any, Results any](
	caller *Caller,
	prepareCall PageRequestFunc[Cursor],
	readPageResponse PageResponseFunc[Cursor, Response, Results],
) *Pager[Cursor, Response, Results] {
	return &Pager[Cursor, Response, Results]{
		mode:             PagerModeOffset,
		caller:           caller,
		prepareCall:      prepareCall,
		readPageResponse: readPageResponse,
	}
}

// GetPage retrieves the page associated with the given cursor.
func (p *Pager[
	Cursor,
	Response,
	Results,
]) GetPage(ctx context.Context, cursor Cursor) (*core.Page[Results], error) {
	var response Response
	pageRequest := &PageRequest[Cursor]{
		Cursor:   cursor,
		Response: &response,
	}

	callParams := p.prepareCall(pageRequest)
	if _, err := p.caller.Call(ctx, callParams); err != nil {
		return nil, err
	}

	pageResponse := p.readPageResponse(response)

	if p.mode == PagerModeOffset {
		return &core.Page[Results]{
			Results: pageResponse.Results,
			NextPageFunc: func(ctx context.Context) (*core.Page[Results], error) {
				page, err := p.GetPage(ctx, pageResponse.Next)
				if err != nil {
					return nil, err
				}
				if len(page.Results) == 0 {
					return nil, core.ErrNoPages
				}
				return page, nil
			},
		}, nil
	}

	return &core.Page[Results]{
		Results: pageResponse.Results,
		NextPageFunc: func(ctx context.Context) (*core.Page[Results], error) {
			if pageResponse.Done {
				return nil, core.ErrNoPages
			}
			return p.GetPage(ctx, pageResponse.Next)
		},
	}, nil
}
