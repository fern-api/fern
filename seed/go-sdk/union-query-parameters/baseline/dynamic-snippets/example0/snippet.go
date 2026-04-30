package example

import (
    context "context"

    fern "github.com/union-query-parameters/fern"
    client "github.com/union-query-parameters/fern/client"
    option "github.com/union-query-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SubscribeEventsRequest{
        EventType: &fern.EventTypeParam{
            EventTypeEnum: fern.EventTypeEnumGroupCreated,
        },
        Tags: &fern.StringOrListParam{
            String: "tags",
        },
    }
    client.Events.Subscribe(
        context.TODO(),
        request,
    )
}
