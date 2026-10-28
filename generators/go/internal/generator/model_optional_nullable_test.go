package generator

import (
	"reflect"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

func fullNameAndWireValue(wireValue string, camel string, pascal string) *common.NameAndWireValue {
	return &common.NameAndWireValue{
		WireValue: wireValue,
		Name: &common.Name{
			OriginalName:       wireValue,
			CamelCase:          &common.SafeAndUnsafeString{UnsafeName: camel, SafeName: camel},
			PascalCase:         &common.SafeAndUnsafeString{UnsafeName: pascal, SafeName: pascal},
			SnakeCase:          &common.SafeAndUnsafeString{UnsafeName: wireValue, SafeName: wireValue},
			ScreamingSnakeCase: &common.SafeAndUnsafeString{UnsafeName: strings.ToUpper(wireValue), SafeName: strings.ToUpper(wireValue)},
		},
	}
}

func TestIsOptionalNullableType(t *testing.T) {
	str := primitiveTypeReference(common.PrimitiveTypeV1String)
	nullable := nullableTypeReference(str)
	optional := optionalTypeReference(str)
	optionalNullable := optionalTypeReference(nullable)
	optionalNullableList := optionalTypeReference(nullableTypeReference(listTypeReference(str)))
	optionalNullableMap := optionalTypeReference(nullableTypeReference(mapTypeReference(str, str)))
	types := map[common.TypeId]*ir.TypeDeclaration{
		"nullableAlias":         {Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{AliasOf: nullable}}},
		"optionalAlias":         {Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{AliasOf: optional}}},
		"optionalNullableAlias": {Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{AliasOf: optionalNullable}}},
		"object":                {Shape: &ir.Type{Object: &ir.ObjectTypeDeclaration{}}},
	}

	for _, tc := range []struct {
		name string
		ref  *ir.TypeReference
		want bool
	}{
		{"nil", nil, false},
		{"primitive", str, false},
		{"nullable", nullable, false},
		{"optional", optional, false},
		{"optional<list>", optionalTypeReference(listTypeReference(str)), false},
		{"optional<nullable>", optionalNullable, true},
		{"optional<nullable<list>>", optionalNullableList, true},
		{"optional<nullable<map>>", optionalNullableMap, true},
		{"optional<nullable<object>>", optionalTypeReference(nullableTypeReference(namedTypeReference("object"))), true},
		{"optional<alias of nullable>", optionalTypeReference(namedTypeReference("nullableAlias")), true},
		{"optional<alias of optional>", optionalTypeReference(namedTypeReference("optionalAlias")), false},
		{"alias of optional<nullable>", namedTypeReference("optionalNullableAlias"), true},
		{"optional<object>", optionalTypeReference(namedTypeReference("object")), false},
		{"missing named type", optionalTypeReference(namedTypeReference("missing")), false},
	} {
		if got := isOptionalNullableType(tc.ref, types); got != tc.want {
			t.Errorf("%s: isOptionalNullableType = %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestVisitObjectTracksOptionalNullableFields(t *testing.T) {
	str := primitiveTypeReference(common.PrimitiveTypeV1String)
	enumID := common.TypeId("type_:HolderCategory")
	objectID := common.TypeId("type_:PersonalFinanceCategory")
	declaredName := func(id common.TypeId, name string) *ir.DeclaredTypeName {
		return &ir.DeclaredTypeName{
			TypeId:       id,
			FernFilepath: &common.FernFilepath{},
			Name:         fullNameAndWireValue(name, strings.ToLower(name[:1])+name[1:], name).Name,
		}
	}
	named := func(id common.TypeId, name string) *ir.TypeReference {
		declared := declaredName(id, name)
		return &ir.TypeReference{Named: &ir.NamedType{
			TypeId:       declared.TypeId,
			FernFilepath: declared.FernFilepath,
			Name:         declared.Name,
		}}
	}
	types := map[common.TypeId]*ir.TypeDeclaration{
		enumID: {
			Name:  declaredName(enumID, "HolderCategory"),
			Shape: &ir.Type{Enum: &ir.EnumTypeDeclaration{}},
		},
		objectID: {
			Name:  declaredName(objectID, "PersonalFinanceCategory"),
			Shape: &ir.Type{Object: &ir.ObjectTypeDeclaration{}},
		},
	}
	property := func(wireValue string, camel string, pascal string, valueType *ir.TypeReference) *ir.ObjectProperty {
		return &ir.ObjectProperty{Name: fullNameAndWireValue(wireValue, camel, pascal), ValueType: valueType}
	}
	object := &ir.ObjectTypeDeclaration{
		Properties: []*ir.ObjectProperty{
			property("account_id", "accountID", "AccountID", str),
			property("mask", "mask", "Mask", nullableTypeReference(str)),
			property("holder_category", "holderCategory", "HolderCategory", optionalTypeReference(nullableTypeReference(named(enumID, "HolderCategory")))),
			property("personal_finance_category", "personalFinanceCategory", "PersonalFinanceCategory", optionalTypeReference(nullableTypeReference(named(objectID, "PersonalFinanceCategory")))),
			property("category", "category", "Category", optionalTypeReference(nullableTypeReference(listTypeReference(str)))),
			property("metadata", "metadata", "Metadata", optionalTypeReference(nullableTypeReference(mapTypeReference(str, str)))),
			property("counterparties", "counterparties", "Counterparties", optionalTypeReference(listTypeReference(str))),
			property("nickname", "nickname", "Nickname", optionalTypeReference(str)),
		},
	}

	writer := newRequireTestWriter(types)
	visitor := &typeVisitor{
		typeName:       "AccountBase",
		typeId:         "type_:AccountBase",
		baseImportPath: "github.com/acme/test",
		importPath:     "github.com/acme/test",
		writer:         writer,
		includeRawJSON: true,
	}
	if err := visitor.VisitObject(object); err != nil {
		t.Fatalf("VisitObject failed: %v", err)
	}
	src := writer.buffer.String()

	for _, want := range []string{
		"var accountBaseNullableFields = map[string]*big.Int{",
		`"mask": accountBaseFieldMask,`,
		`"holder_category": accountBaseFieldHolderCategory,`,
		`"personal_finance_category": accountBaseFieldPersonalFinanceCategory,`,
		`"category": accountBaseFieldCategory,`,
		`"metadata": accountBaseFieldMetadata,`,
		"presentFields, err := internal.ExplicitFieldsFromJSON(data, accountBaseNullableFields)",
		"a.require(presentFields)",
		"a.rawJSON = json.RawMessage(data)",
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted object missing %q\n---\n%s", want, src)
		}
	}
	for _, unwanted := range []string{
		`"account_id": accountBaseFieldAccountID,`,
		`"counterparties": accountBaseFieldCounterparties,`,
		`"nickname": accountBaseFieldNickname,`,
		"RequiredNullableFields",
	} {
		if strings.Contains(src, unwanted) {
			t.Errorf("emitted object unexpectedly contains %q\n---\n%s", unwanted, src)
		}
	}

	if got, want := writer.requiredNullableRoundTripTests["AccountBase"], []string{"mask"}; !reflect.DeepEqual(got, want) {
		t.Errorf("required-nullable round-trip keys = %v, want %v", got, want)
	}
	if got, want := writer.optionalNullableRoundTripTests["AccountBase"], []string{"holder_category", "personal_finance_category", "category", "metadata"}; !reflect.DeepEqual(got, want) {
		t.Errorf("optional-nullable round-trip keys = %v, want %v", got, want)
	}
}

func TestWriteOptionalNullableRoundTripTests(t *testing.T) {
	writer := newRequireTestWriter(nil)
	writer.WriteOptionalNullableRoundTripTests("AccountBase", []string{"holder_category", "category"})
	src := writer.buffer.String()
	for _, want := range []string{
		"func TestOptionalNullableRoundTripAccountBase(t *testing.T) {",
		"optionalNullableKeys := []string{",
		`"holder_category",`,
		`"category",`,
		"require.NoError(t, json.Unmarshal([]byte(`{\"holder_category\":null,\"category\":null}`), &obj))",
		"for _, key := range optionalNullableKeys {",
		`require.True(t, ok, "optional nullable field %q received as null should be present in the output", key)`,
		`assert.NotContains(t, result, key, "optional nullable field %q absent from the input should be absent from the output", key)`,
		`t.Run("FreshValueOmits"`,
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted round-trip test missing %q\n---\n%s", want, src)
		}
	}
}

func TestWriteRequiredNullableRoundTripTestsUnchanged(t *testing.T) {
	writer := newRequireTestWriter(nil)
	writer.WriteRequiredNullableRoundTripTests("Account", []string{"mask"})
	src := writer.buffer.String()
	for _, want := range []string{
		"func TestRequiredNullableRoundTripAccount(t *testing.T) {",
		"requiredNullableKeys := []string{",
		`require.True(t, ok, "required nullable field %q received as null should be present in the output", key)`,
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted round-trip test missing %q\n---\n%s", want, src)
		}
	}
}
