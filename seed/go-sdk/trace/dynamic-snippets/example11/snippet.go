package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    option "github.com/trace/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.GetAttemptedMigrationsRequest{
        AdminKeyHeader: "admin-key-header",
    }
    _, err := client.Migration.GetAttemptedMigrations(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
