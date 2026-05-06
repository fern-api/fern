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
        AssignedTo: fern.String(
            "assigned_to",
        ),
        IsComplete: fern.String(
            "is_complete",
        ),
        Date: fern.String(
            "date",
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
