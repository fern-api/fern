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

// PageRequestFunc prepares the *CallParams from the given page request.
type PageRequestFunc[Cursor comparable] func(request *core.PageRequest[Cursor]) *CallParams

// PageResponseFunc extracts the next page information from the response.
type PageResponseFunc[
	Cursor comparable,
	Response any,
	Results any,
] func(Response) *core.PageResponse[Cursor, Results]

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
]) GetPage(ctx context.Context, cursor Cursor) (*core.Page[Cursor, Results], error) {
	var response Response
	pageRequest := &core.PageRequest[Cursor]{
		Cursor:   cursor,
		Response: &response,
	}

	callParams := p.prepareCall(pageRequest)
	httpResponse, err := p.caller.Call(ctx, callParams)
	if err != nil {
		return nil, err
	}

	pageResponse := p.readPageResponse(response)

	if p.mode == PagerModeOffset {
		return &core.Page[Cursor, Results]{
			Results:     pageResponse.Results,
			RawResponse: *pageResponse,
			HTTPRawResponse: core.HTTPPageResponse{
				StatusCode: httpResponse.StatusCode,
				Header:     httpResponse.Header,
			},
			NextPageFunc: func(ctx context.Context) (*core.Page[Cursor, Results], error) {
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

	return &core.Page[Cursor, Results]{
		Results:     pageResponse.Results,
		RawResponse: *pageResponse,
		HTTPRawResponse: core.HTTPPageResponse{
			StatusCode: httpResponse.StatusCode,
			Header:     httpResponse.Header,
		},
		NextPageFunc: func(ctx context.Context) (*core.Page[Cursor, Results], error) {
			if pageResponse.Done {
				return nil, core.ErrNoPages
			}
			return p.GetPage(ctx, pageResponse.Next)
		},
	}, nil
}
