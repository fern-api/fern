package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

func primitiveTypeReference(primitive common.PrimitiveTypeV1) *ir.TypeReference {
	return &ir.TypeReference{Primitive: &ir.PrimitiveType{V1: primitive}}
}

func listTypeReference(elementType *ir.TypeReference) *ir.TypeReference {
	return &ir.TypeReference{Container: &ir.ContainerType{Type: "list", List: elementType}}
}

func setTypeReference(elementType *ir.TypeReference) *ir.TypeReference {
	return &ir.TypeReference{Container: &ir.ContainerType{Type: "set", Set: elementType}}
}

func mapTypeReference(keyType, valueType *ir.TypeReference) *ir.TypeReference {
	return &ir.TypeReference{Container: &ir.ContainerType{
		Type: "map",
		Map:  &ir.MapType{KeyType: keyType, ValueType: valueType},
	}}
}

func optionalTypeReference(valueType *ir.TypeReference) *ir.TypeReference {
	return &ir.TypeReference{Container: &ir.ContainerType{Type: "optional", Optional: valueType}}
}

func nullableTypeReference(valueType *ir.TypeReference) *ir.TypeReference {
	return &ir.TypeReference{Container: &ir.ContainerType{Type: "nullable", Nullable: valueType}}
}

func namedTypeReference(typeId common.TypeId) *ir.TypeReference {
	return &ir.TypeReference{Named: &ir.NamedType{TypeId: typeId}}
}

func aliasTypes(typeId common.TypeId, aliasOf *ir.TypeReference) map[common.TypeId]*ir.TypeDeclaration {
	return map[common.TypeId]*ir.TypeDeclaration{
		typeId: {
			Shape: &ir.Type{
				Type:  "alias",
				Alias: &ir.AliasTypeDeclaration{AliasOf: aliasOf},
			},
		},
	}
}

func TestMaybeDatePropertyContainers(t *testing.T) {
	dateType := primitiveTypeReference(common.PrimitiveTypeV1Date)
	dateTimeType := primitiveTypeReference(common.PrimitiveTypeV1DateTime)
	stringType := primitiveTypeReference(common.PrimitiveTypeV1String)

	for _, test := range []struct {
		name                string
		valueType           *ir.TypeReference
		types               map[common.TypeId]*ir.TypeDeclaration
		expectedType        string
		expectedConstructor string
		expectedConverter   string
		expectedIsDateTime  bool
	}{
		{
			name:                "list of dates",
			valueType:           listTypeReference(dateType),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateList",
			expectedConverter:   "internal.TimesFromDateList",
		},
		{
			name:                "set of dates",
			valueType:           setTypeReference(dateType),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateList",
			expectedConverter:   "internal.TimesFromDateList",
		},
		{
			name:                "map of dates",
			valueType:           mapTypeReference(stringType, dateType),
			expectedType:        "map[string]*internal.Date",
			expectedConstructor: "internal.NewDateMap",
			expectedConverter:   "internal.TimesFromDateMap",
		},
		{
			name:                "optional list of dates",
			valueType:           optionalTypeReference(listTypeReference(dateType)),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateList",
			expectedConverter:   "internal.TimesFromDateList",
		},
		{
			name:                "nullable list of dates",
			valueType:           nullableTypeReference(listTypeReference(dateType)),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateList",
			expectedConverter:   "internal.TimesFromDateList",
		},
		{
			name:                "alias of a list of dates",
			valueType:           namedTypeReference("dateList"),
			types:               aliasTypes("dateList", listTypeReference(dateType)),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateList",
			expectedConverter:   "internal.TimesFromDateList",
		},
		{
			name:                "optional alias of a list of dates",
			valueType:           optionalTypeReference(namedTypeReference("dateList")),
			types:               aliasTypes("dateList", listTypeReference(dateType)),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateListFromPtr",
			expectedConverter:   "internal.TimesPtrFromDateList",
		},
		{
			name:                "list of aliased dates",
			valueType:           listTypeReference(namedTypeReference("dateAlias")),
			types:               aliasTypes("dateAlias", dateType),
			expectedType:        "[]*internal.Date",
			expectedConstructor: "internal.NewDateList",
			expectedConverter:   "internal.TimesFromDateList",
		},
		{
			name:                "list of date-times",
			valueType:           listTypeReference(dateTimeType),
			expectedType:        "[]*internal.DateTime",
			expectedConstructor: "internal.NewDateTimeList",
			expectedConverter:   "internal.TimesFromDateTimeList",
			expectedIsDateTime:  true,
		},
		{
			name:                "set of date-times",
			valueType:           setTypeReference(dateTimeType),
			expectedType:        "[]*internal.DateTime",
			expectedConstructor: "internal.NewDateTimeList",
			expectedConverter:   "internal.TimesFromDateTimeList",
			expectedIsDateTime:  true,
		},
		{
			name:                "map of date-times",
			valueType:           mapTypeReference(stringType, dateTimeType),
			expectedType:        "map[string]*internal.DateTime",
			expectedConstructor: "internal.NewDateTimeMap",
			expectedConverter:   "internal.TimesFromDateTimeMap",
			expectedIsDateTime:  true,
		},
		{
			name:                "optional alias of a list of date-times",
			valueType:           optionalTypeReference(namedTypeReference("dateTimeList")),
			types:               aliasTypes("dateTimeList", listTypeReference(dateTimeType)),
			expectedType:        "[]*internal.DateTime",
			expectedConstructor: "internal.NewDateTimeListFromPtr",
			expectedConverter:   "internal.TimesPtrFromDateTimeList",
			expectedIsDateTime:  true,
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			date := maybeDateProperty(test.valueType, nameAndWireValue("Value"), false, test.types)
			if date == nil {
				t.Fatalf("expected a date property for %s", test.name)
			}
			if date.TypeDeclaration != test.expectedType {
				t.Errorf("expected type %q, got %q", test.expectedType, date.TypeDeclaration)
			}
			if date.Constructor != test.expectedConstructor {
				t.Errorf("expected constructor %q, got %q", test.expectedConstructor, date.Constructor)
			}
			if date.TimeConverter != test.expectedConverter {
				t.Errorf("expected converter %q, got %q", test.expectedConverter, date.TimeConverter)
			}
			if date.IsDateTime != test.expectedIsDateTime {
				t.Errorf("expected isDateTime %v, got %v", test.expectedIsDateTime, date.IsDateTime)
			}
		})
	}
}

func TestMaybeDatePropertyNonDateContainers(t *testing.T) {
	stringType := primitiveTypeReference(common.PrimitiveTypeV1String)
	dateType := primitiveTypeReference(common.PrimitiveTypeV1Date)

	for _, test := range []struct {
		name      string
		valueType *ir.TypeReference
	}{
		{
			name:      "list of strings",
			valueType: listTypeReference(stringType),
		},
		{
			name:      "map with non-string keys",
			valueType: mapTypeReference(primitiveTypeReference(common.PrimitiveTypeV1Integer), dateType),
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			if date := maybeDateProperty(test.valueType, nameAndWireValue("Value"), false, nil); date != nil {
				t.Errorf("expected no date property for %s, got %q", test.name, date.TypeDeclaration)
			}
		})
	}
}
