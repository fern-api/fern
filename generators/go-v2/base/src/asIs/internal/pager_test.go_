package internal

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type TestPageResponse struct {
	Items []TestPageItem `json:"items"`
	Next  string         `json:"next"`
}

type TestPageItem struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func TestPager(t *testing.T) {
	tests := []struct {
		description string
		givePages   []TestPageResponse
		giveCursor  string
		wantItems   []TestPageItem
		wantError   error
	}{
		{
			description: "handles multiple pages successfully",
			givePages: []TestPageResponse{
				{
					Items: []TestPageItem{{ID: "1", Name: "First"}},
					Next:  "abc",
				},
				{
					Items: []TestPageItem{{ID: "2", Name: "Second"}},
					Next:  "def",
				},
				{
					Items: []TestPageItem{{ID: "3", Name: "Third"}},
					Next:  "",
				},
			},
			wantItems: []TestPageItem{
				{ID: "1", Name: "First"},
				{ID: "2", Name: "Second"},
				{ID: "3", Name: "Third"},
			},
		},
		{
			description: "handles empty response",
			givePages: []TestPageResponse{
				{
					Items: []TestPageItem{},
					Next:  "",
				},
			},
			wantItems: nil,
		},
		{
			description: "handles single page",
			givePages: []TestPageResponse{
				{
					Items: []TestPageItem{{ID: "1", Name: "Only"}},
					Next:  "",
				},
			},
			wantItems: []TestPageItem{
				{ID: "1", Name: "Only"},
			},
		},
		{
			description: "handles initial cursor",
			giveCursor:  "abc",
			givePages: []TestPageResponse{
				{
					Items: []TestPageItem{{ID: "1", Name: "First"}},
					Next:  "",
				},
			},
			wantItems: []TestPageItem{
				{ID: "1", Name: "First"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			var pageIndex int
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if pageIndex >= len(tt.givePages) {
					t.Fatal("requested more pages than available")
				}
				if pageIndex > 0 {
					assert.Equal(t, tt.givePages[pageIndex-1].Next, r.URL.Query().Get("cursor"))
				}
				require.NoError(t, json.NewEncoder(w).Encode(tt.givePages[pageIndex]))
				pageIndex++
			}))
			defer server.Close()

			caller := NewCaller(
				&CallerParams{
					Client: server.Client(),
				},
			)
			pager := NewCursorPager(
				caller,
				func(request *PageRequest[*string]) *CallParams {
					url := server.URL
					if request.Cursor != nil {
						url += "?cursor=" + *request.Cursor
					}
					return &CallParams{
						URL:      url,
						Method:   http.MethodGet,
						Response: request.Response,
					}
				},
				func(response *TestPageResponse) *PageResponse[*string, *TestPageItem] {
					var items []*TestPageItem
					for _, item := range response.Items {
						itemCopy := item
						items = append(items, &itemCopy)
					}
					var next *string
					if response.Next != "" {
						next = &response.Next
					}
					return &PageResponse[*string, *TestPageItem]{
						Results: items,
						Next:    next,
						Done:    response.Next == "",
					}
				},
			)

			page, err := pager.GetPage(context.Background(), &tt.giveCursor)
			if tt.wantError != nil {
				assert.Equal(t, tt.wantError, err)
				return
			}
			require.NoError(t, err)

			var items []TestPageItem
			iter := page.Iterator()
			for iter.Next(context.Background()) {
				item := iter.Current()
				items = append(items, TestPageItem{
					ID:   item.ID,
					Name: item.Name,
				})
			}
			require.NoError(t, iter.Err())
			assert.Equal(t, tt.wantItems, items)
		})
	}
}
