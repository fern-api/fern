package example

import (
    context "context"

    fern "github.com/union-query-parameters/fern"
    client "github.com/union-query-parameters/fern/client"
    option "github.com/union-query-parameters/fern/option"
)

func do() error {
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
    _, err := client.Events.Subscribe(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
