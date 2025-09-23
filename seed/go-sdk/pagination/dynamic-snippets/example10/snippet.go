package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    context "context"
    inlineusers "github.com/pagination/fern/inlineusers"
    fern "github.com/pagination/fern"
    uuid "github.com/google/uuid"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.InlineUsers.InlineUsers.ListWithExtendedResults(
        context.TODO(),
        &inlineusers.ListUsersExtendedRequest{
            Cursor: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
        },
    )
}
