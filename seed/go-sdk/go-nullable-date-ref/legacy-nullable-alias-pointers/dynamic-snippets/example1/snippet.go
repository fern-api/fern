package example

import (
    context "context"

    fern "github.com/go-nullable-date-ref/fern"
    client "github.com/go-nullable-date-ref/fern/client"
    option "github.com/go-nullable-date-ref/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Report{
        CreatedDate: fern.MustParseDate(
            "2023-01-15",
        ),
        FraudDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        ResolvedDate: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Description: func() *fern.NullableString {
            var value fern.NullableString = fern.String(
                "description",
            )
            return &value
        }(),
        Tags: &fern.NullableTags{
            "tags",
            "tags",
        },
        Metadata: &fern.NullableMetadata{
            "metadata": map[string]any{
                "key": "value",
            },
        },
        TagsAlias: func() *fern.TagsAlias {
            var value fern.TagsAlias = &fern.NullableTags{
                "tags_alias",
                "tags_alias",
            }
            return &value
        }(),
        MetadataAlias: func() *fern.MetadataAlias {
            var value fern.MetadataAlias = &fern.NullableMetadata{
                "metadata_alias": map[string]any{
                    "key": "value",
                },
            }
            return &value
        }(),
        Extra: func() *fern.AnyValue {
            var value fern.AnyValue = map[string]any{
                "key": "value",
            }
            return &value
        }(),
        NullableExtra: func() *fern.NullableAnyValue {
            var value fern.NullableAnyValue = map[string]any{
                "key": "value",
            }
            return &value
        }(),
        Title: "title",
    }
    client.Reports.Create(
        context.TODO(),
        request,
    )
}
