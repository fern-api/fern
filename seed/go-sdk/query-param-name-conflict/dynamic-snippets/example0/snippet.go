package example

import (
    context "context"

    fern "github.com/query-param-name-conflict/fern"
    client "github.com/query-param-name-conflict/fern/client"
    option "github.com/query-param-name-conflict/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.BulkUpdateTasksRequest{}
    _, err := client.BulkUpdateTasks(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
