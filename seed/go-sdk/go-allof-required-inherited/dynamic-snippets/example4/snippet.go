package example

import (
    context "context"

    fern "github.com/go-allof-required-inherited/fern"
    client "github.com/go-allof-required-inherited/fern/client"
    option "github.com/go-allof-required-inherited/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ExternalPaymentScheduleRequest{
        StartDate: fern.MustParseDate(
            "2023-01-15",
        ),
        Interval: fern.PaymentScheduleIntervalWeekly,
        IntervalExecutionDay: 1,
    }
    client.CreatePaymentSchedule(
        context.TODO(),
        request,
    )
}
