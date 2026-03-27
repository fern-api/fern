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
    request := &fern.BulkUpdateTasksRequest{}
    client.BulkUpdateTasks(
        context.TODO(),
        request,
    )
}
