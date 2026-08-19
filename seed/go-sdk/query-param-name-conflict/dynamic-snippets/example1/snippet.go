package example

import (
    context "context"

    fern "github.com/query-param-name-conflict/fern"
    client "github.com/query-param-name-conflict/fern/client"
    option "github.com/query-param-name-conflict/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.BulkUpdateTasksRequest{
        FilterAssignedTo: fern.String(
            "filter_assigned_to",
        ),
        FilterIsComplete: fern.String(
            "filter_is_complete",
        ),
        FilterDate: fern.String(
            "filter_date",
        ),
        Fields: fern.String(
            "_fields",
        ),
        BulkUpdateTasksRequestAssignedTo: fern.String(
            "assigned_to",
        ),
        BulkUpdateTasksRequestDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        BulkUpdateTasksRequestIsComplete: fern.Bool(
            true,
        ),
        Text: fern.String(
            "text",
        ),
    }
    client.BulkUpdateTasks(
        context.TODO(),
        request,
    )
}
