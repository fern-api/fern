package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
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
    request := &fern.FileNotificationServiceGetExceptionRequest{
        NotificationID: "notificationId",
    }
    client.FileNotificationService.FileNotificationServiceGetException(
        context.TODO(),
        request,
    )
}
