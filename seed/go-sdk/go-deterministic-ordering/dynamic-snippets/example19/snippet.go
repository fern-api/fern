package example

import (
    context "context"

    fern "github.com/go-deterministic-ordering/fern"
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
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
    request := &fern.TypesObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        Integer: fern.Int(
            1,
        ),
        Long: fern.Int64(
            int64(1000000),
        ),
        Double: fern.Float64(
            1.1,
        ),
        Bool: fern.Bool(
            true,
        ),
        Datetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Date: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        UUID: fern.String(
            "uuid",
        ),
        Base64: fern.String(
            "base64",
        ),
        List: []string{
            "list",
            "list",
        },
        Set: []string{
            "set",
            "set",
        },
        Map: map[string]*string{
            "map": fern.String(
                "map",
            ),
        },
        Bigint: fern.Int(
            1,
        ),
    }
    client.EndpointsContentType.EndpointsContentTypePostJSONPatchContentWithCharsetType(
        context.TODO(),
        request,
    )
}
