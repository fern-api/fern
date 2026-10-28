package example

import (
    context "context"

    client "github.com/error-responses-shared/fern/client"
    messages "github.com/error-responses-shared/fern/messages"
    option "github.com/error-responses-shared/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &messages.Message{
        Sid: "sid",
        Body: "body",
    }
    client.Messages.Messages.CreateMessage(
        context.TODO(),
        request,
    )
}
