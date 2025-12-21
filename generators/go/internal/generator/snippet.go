package generator

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/fern-api/fern-go/internal/ast"
	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// SnippetWriter writes codes snippets as AST expressions from examples.
type SnippetWriter struct {
	baseImportPath string
	unionVersion   UnionVersion
	types          map[common.TypeId]*ir.TypeDeclaration
	writer         *fileWriter
}

// NewSnippetWriter constructs a new *SnippetWriter.
func NewSnippetWriter(
	baseImportPath string,
	unionVersion UnionVersion,
	types map[common.TypeId]*ir.TypeDeclaration,
	writer *fileWriter,
) *SnippetWriter {
	return &SnippetWriter{
		baseImportPath: baseImportPath,
		unionVersion:   unionVersion,
		types:          types,
		writer:         writer,
	}
}

// GetSnippetForExampleTypeReference returns an AST expression
// that represents the snippet for the given example.
func (s *SnippetWriter) GetSnippetForExampleTypeReference(
	exampleTypeReference *ir.ExampleTypeReference,
) ast.Expr {
	if exampleTypeReference == nil {
		return nil
	}
	return s.getSnippetForExampleTypeReferenceShape(exampleTypeReference.Shape)
}

func (s *SnippetWriter) getSnippetForExampleTypeReferenceShape(
	exampleTypeShape *ir.ExampleTypeReferenceShape,
) ast.Expr {
	if exampleTypeShape == nil {
		return nil
	}
	switch exampleTypeShape.Type {
	case "primitive":
		return s.getSnippetForPrimitive(exampleTypeShape.Primitive)
	case "container":
		return s.getSnippetForContainer(exampleTypeShape.Container)
	case "unknown":
		return s.getSnippetForUnknown(exampleTypeShape.Unknown)
	case "named":
		return s.getSnippetForExampleTypeShape(
			exampleTypeShape.Named.TypeName,
			exampleTypeShape.Named.Shape,
		)
	}
	return nil
}

func (s *SnippetWriter) getSnippetForExampleTypeShape(
	declaredTypeName *ir.DeclaredTypeName,
	exampleTypeShape *ir.ExampleTypeShape,
) ast.Expr {
	importedReference := s.declaredTypeNameToImportedReference(declaredTypeName)
	switch exampleTypeShape.Type {
	case "alias":
		return s.GetSnippetForExampleTypeReference(exampleTypeShape.Alias.Value)
	case "enum":
		return s.getSnippetForExampleEnumType(
			importedReference,
			exampleTypeShape.Enum,
		)
	case "object":
		return s.getSnippetForExampleObjectType(
			importedReference,
			exampleTypeShape.Object,
		)
	case "union":
		return s.getSnippetForExampleUnionType(
			declaredTypeName,
			importedReference,
			exampleTypeShape.Union,
		)
	case "undiscriminatedUnion":
		return s.getSnippetForExampleUndiscriminatedUnionType(
			declaredTypeName,
			importedReference,
			exampleTypeShape.UndiscriminatedUnion,
		)
	}
	return nil
}

func (s *SnippetWriter) getSnippetForExampleEnumType(
	importedReference *ast.ImportedReference,
	exampleEnumType *ir.ExampleEnumType,
) ast.Expr {
	return &ast.ImportedReference{
		Name:       importedReference.Name + exampleEnumType.Value.Name.PascalCase.UnsafeName,
		ImportPath: importedReference.ImportPath,
	}
}

func (s *SnippetWriter) getSnippetForExampleObjectType(
	importedReference *ast.ImportedReference,
	exampleObjectType *ir.ExampleObjectType,
) ast.Expr {
	fields := make([]*ast.Field, 0, len(exampleObjectType.Properties))
	for _, property := range exampleObjectType.Properties {
		if s.isExampleObjectPropertyLiteral(property) {
			// Literal object properties aren't included in the snippet.
			continue
		}
		fields = append(
			fields,
			&ast.Field{
				Key:   goExportedFieldName(property.Name.Name.PascalCase.UnsafeName),
				Value: s.GetSnippetForExampleTypeReference(property.Value),
			},
		)
	}
	return &ast.StructType{
		Name:   importedReference,
		Fields: fields,
	}
}

func (s *SnippetWriter) getSnippetForExampleUnionType(
	declaredTypeName *ir.DeclaredTypeName,
	importedReference *ast.ImportedReference,
	exampleUnionType *ir.ExampleUnionType,
) ast.Expr {
	if s.isExampleUnionTypeLiteral(declaredTypeName, exampleUnionType) {
		// Union literal constructors don't require any arguments.
		return &ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name: fmt.Sprintf(
					"New%sWith%s",
					importedReference.Name,
					exampleUnionType.SingleUnionType.WireDiscriminantValue.Name.PascalCase.UnsafeName,
				),
				ImportPath: importedReference.ImportPath,
			},
		}
	}
	parameter := s.getSnippetForExampleSingleUnionTypeProperties(exampleUnionType.SingleUnionType.Shape)
	if parameter == nil {
		// This union type doesn't have any properties, so we can just construct it
		// as an in-line struct.
		return &ast.StructType{
			Name: importedReference,
			Fields: []*ast.Field{
				{
					Key: goExportedFieldName(exampleUnionType.Discriminant.Name.PascalCase.UnsafeName),
					Value: &ast.BasicLit{
						Value: fmt.Sprintf("%q", exampleUnionType.SingleUnionType.WireDiscriminantValue.Name.OriginalName),
					},
				},
			},
		}
	}
	if s.unionVersion == UnionVersionV1 {
		// In UnionVersionV1, we just return a struct literal with the union type property set.
		return &ast.StructType{
			Name: importedReference,
			Fields: []*ast.Field{
				{
					Key:   goExportedFieldName(exampleUnionType.SingleUnionType.WireDiscriminantValue.Name.PascalCase.UnsafeName),
					Value: parameter,
				},
			},
		}
	}
	return &ast.CallExpr{
		FunctionName: &ast.ImportedReference{
			Name: fmt.Sprintf(
				"New%sFrom%s",
				importedReference.Name,
				exampleUnionType.SingleUnionType.WireDiscriminantValue.Name.PascalCase.UnsafeName,
			),
			ImportPath: importedReference.ImportPath,
		},
		Parameters: []ast.Expr{parameter},
	}
}

func (s *SnippetWriter) getSnippetForExampleSingleUnionTypeProperties(
	exampleSingleUnionTypeProperties *ir.ExampleSingleUnionTypeProperties,
) ast.Expr {
	switch exampleSingleUnionTypeProperties.Type {
	case "samePropertiesAsObject":
		typeDeclaration := s.types[exampleSingleUnionTypeProperties.SamePropertiesAsObject.TypeId]
		if typeDeclaration == nil {
			// This should be unreachable.
			return nil
		}
		importedReference := s.declaredTypeNameToImportedReference(typeDeclaration.Name)
		return s.getSnippetForExampleObjectType(
			importedReference,
			exampleSingleUnionTypeProperties.SamePropertiesAsObject.Object,
		)
	case "singleProperty":
		return s.GetSnippetForExampleTypeReference(exampleSingleUnionTypeProperties.SingleProperty)
	}
	return nil
}

func (s *SnippetWriter) getSnippetForExampleUndiscriminatedUnionType(
	declaredTypeName *ir.DeclaredTypeName,
	importedReference *ast.ImportedReference,
	exampleUndiscriminatedUnionType *ir.ExampleUndiscriminatedUnionType,
) ast.Expr {
	member := s.getUndiscriminatedUnionMember(declaredTypeName, exampleUndiscriminatedUnionType)
	if member == nil {
		return nil
	}
	scope := s.writer.scope.Child()
	field := typeReferenceToUndiscriminatedUnionField(member.Type, s.types, scope)
	if isTypeReferenceLiteral(member.Type) {
		// Union literal constructors don't require any arguments.
		return &ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name: fmt.Sprintf(
					"New%sWith%s",
					importedReference.Name,
					strings.Title(field),
				),
				ImportPath: importedReference.ImportPath,
			},
		}
	}
	parameter := s.GetSnippetForExampleTypeReference(exampleUndiscriminatedUnionType.SingleUnionType)
	if s.unionVersion == UnionVersionV1 {
		// In UnionVersionV1, we just return a struct literal with the union type property set.
		return &ast.StructType{
			Name: importedReference,
			Fields: []*ast.Field{
				{
					Key:   field,
					Value: parameter,
				},
			},
		}
	}
	return &ast.CallExpr{
		FunctionName: &ast.ImportedReference{
			Name: fmt.Sprintf(
				"New%sFrom%s",
				importedReference.Name,
				field,
			),
			ImportPath: importedReference.ImportPath,
		},
		Parameters: []ast.Expr{
			parameter,
		},
	}
}

func (s *SnippetWriter) getSnippetForContainer(
	exampleContainer *ir.ExampleContainer,
) ast.Expr {
	switch exampleContainer.Type {
	case "list":
		return s.getSnippetForListOrSet(exampleContainer.List.List)
	case "set":
		return s.getSnippetForListOrSet(exampleContainer.Set.Set)
	case "nullable":
		if exampleContainer.Nullable == nil || exampleContainer.Nullable.Nullable == nil {
			return nil
		}
		if primitive := maybePrimitiveExampleTypeReferenceShape(exampleContainer.Nullable.Nullable.Shape); primitive != nil {
			return s.getSnippetForOptionalPrimitive(primitive)
		}
		return s.GetSnippetForExampleTypeReference(exampleContainer.Nullable.Nullable)
	case "optional":
		if exampleContainer.Optional == nil || exampleContainer.Optional.Optional == nil {
			return nil
		}
		if primitive := maybePrimitiveExampleTypeReferenceShape(exampleContainer.Optional.Optional.Shape); primitive != nil {
			return s.getSnippetForOptionalPrimitive(primitive)
		}
		return s.GetSnippetForExampleTypeReference(exampleContainer.Optional.Optional)
	case "map":
		return s.getSnippetForMap(exampleContainer.Map.Map)
	}
	return nil
}

func (s *SnippetWriter) getSnippetForListOrSet(
	exampleTypeReferences []*ir.ExampleTypeReference,
) ast.Expr {
	index := -1
	var expressions []ast.Expr
	for i, exampleTypeReference := range exampleTypeReferences {
		expr := s.GetSnippetForExampleTypeReference(exampleTypeReference)
		if expr == nil {
			continue
		}
		if index == -1 {
			index = i
		}
		expressions = append(expressions, expr)
	}
	if len(expressions) == 0 {
		return nil
	}
	return &ast.ArrayLit{
		Type: &ast.ArrayType{
			Expr: exampleTypeReferenceShapeToGoType(
				exampleTypeReferences[index].Shape,
				s.types,
				s.baseImportPath,
			),
		},
		Values: expressions,
	}
}

func (s *SnippetWriter) getSnippetForMap(
	exampleKeyValuePairs []*ir.ExampleKeyValuePair,
) ast.Expr {
	var (
		keys   []ast.Expr
		values []ast.Expr
	)
	for _, pair := range exampleKeyValuePairs {
		key := s.GetSnippetForExampleTypeReference(pair.Key)
		if key == nil {
			continue
		}
		value := s.GetSnippetForExampleTypeReference(pair.Value)
		if value == nil {
			continue
		}
		keys = append(keys, key)
		values = append(values, value)
	}
	if len(keys) == 0 {
		return nil
	}

	visitor := &exampleContainerVisitor{
		baseImportPath: s.baseImportPath,
		types:          s.types,
	}
	_ = visitor.VisitMap(&ir.ExampleMapContainer{
		Map: exampleKeyValuePairs,
	})
	mapType, ok := visitor.value.(*ast.MapType)
	if !ok {
		// This should be unreachable.
		return nil
	}

	return &ast.MapLit{
		Type:   mapType,
		Keys:   keys,
		Values: values,
	}
}

func (s *SnippetWriter) getSnippetForUnknown(
	unknownExample interface{},
) ast.Expr {
	// Unmarshal stores one of the following types in the interface value (re: https://pkg.go.dev/encoding/json#Unmarshal).
	switch v := unknownExample.(type) {
	case bool:
		return &ast.BasicLit{
			Value: strconv.FormatBool(v),
		}
	case string:
		value := fmt.Sprintf("%q", v)
		if strings.Contains(v, `"`) {
			value = fmt.Sprintf("`%s`", value)
		}
		return &ast.BasicLit{
			Value: value,
		}
	case float64:
		return &ast.BasicLit{
			Value: strconv.FormatFloat(v, 'f', -1, 64),
		}
	case []interface{}:
		values := make([]ast.Expr, 0, len(v))
		for _, value := range v {
			values = append(values, s.getSnippetForUnknown(value))
		}
		return &ast.ArrayLit{
			Type: &ast.ArrayType{
				Expr: &ast.LocalReference{
					Name: "interface{}",
				},
			},
			Values: values,
		}
	case map[string]interface{}:
		var (
			keys   = make([]ast.Expr, 0, len(v))
			values = make([]ast.Expr, 0, len(v))
		)
		// Sort the map keys for deterministic results.
		sortedKeys := make([]string, 0, len(v))
		for key := range v {
			sortedKeys = append(sortedKeys, key)
		}
		sort.Slice(sortedKeys, func(i, j int) bool { return sortedKeys[i] < sortedKeys[j] })
		for _, key := range sortedKeys {
			keys = append(keys, s.getSnippetForUnknown(key))
			values = append(values, s.getSnippetForUnknown(v[key]))
		}
		return &ast.MapLit{
			Type: &ast.MapType{
				Key: &ast.LocalReference{
					Name: "string",
				},
				Value: &ast.LocalReference{
					Name: "interface{}",
				},
			},
			Keys:   keys,
			Values: values,
		}
	}
	return &ast.BasicLit{
		Value: "nil",
	}
}

func (s *SnippetWriter) getSnippetForOptionalPrimitive(
	examplePrimitive *ir.ExamplePrimitive,
) ast.Expr {
	if examplePrimitive.Type == "base64" {
		return s.getSnippetForPrimitive(examplePrimitive)
	}
	return &ast.CallExpr{
		FunctionName: &ast.ImportedReference{
			Name:       examplePrimitiveToPointerConstructorName(examplePrimitive),
			ImportPath: s.baseImportPath,
		},
		Parameters: []ast.Expr{
			s.getSnippetForPrimitive(examplePrimitive),
		},
	}
}

func (s *SnippetWriter) getSnippetForPrimitive(
	exampleTypeReference *ir.ExamplePrimitive,
) ast.Expr {
	switch exampleTypeReference.Type {
	case "integer":
		return &ast.BasicLit{
			Value: strconv.Itoa(exampleTypeReference.Integer),
		}
	case "long":
		return &ast.BasicLit{
			Value: strconv.FormatInt(exampleTypeReference.Long, 10),
		}
	case "uint":
		// TODO: Add support for uint.
		return &ast.BasicLit{
			Value: strconv.Itoa(exampleTypeReference.Uint),
		}
	case "uint64":
		// TODO: Add support for uint64.
		return &ast.BasicLit{
			Value: strconv.FormatInt(exampleTypeReference.Uint64, 10),
		}
	case "float":
		return &ast.BasicLit{
			Value: strconv.FormatFloat(exampleTypeReference.Float, 'f', -1, 64),
		}
	case "double":
		return &ast.BasicLit{
			Value: strconv.FormatFloat(exampleTypeReference.Double, 'f', -1, 64),
		}
	case "string":
		value := fmt.Sprintf("%q", exampleTypeReference.String.Original)
		if strings.Contains(exampleTypeReference.String.Original, `"`) {
			value = fmt.Sprintf("`%s`", exampleTypeReference.String.Original)
		}
		return &ast.BasicLit{
			Value: value,
		}
	case "boolean":
		return &ast.BasicLit{
			Value: strconv.FormatBool(exampleTypeReference.Boolean),
		}
	case "datetime":
		return &ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name:       "MustParseDateTime",
				ImportPath: s.baseImportPath,
			},
			Parameters: []ast.Expr{
				&ast.BasicLit{
					Value: fmt.Sprintf("%q", exampleTypeReference.Datetime.Datetime.Format(time.RFC3339)),
				},
			},
		}
	case "date":
		return &ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name:       "MustParseDate",
				ImportPath: s.baseImportPath,
			},
			Parameters: []ast.Expr{
				&ast.BasicLit{
					Value: fmt.Sprintf("%q", exampleTypeReference.Date.Format("2006-01-02")),
				},
			},
		}
	case "uuid":
		return &ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name:       "MustParse",
				ImportPath: "github.com/google/uuid",
			},
			Parameters: []ast.Expr{
				&ast.BasicLit{
					Value: fmt.Sprintf("%q", exampleTypeReference.Uuid.String()),
				},
			},
		}
	case "base64":
		return &ast.BasicLit{
			Value: fmt.Sprintf("[]byte(%q)", string(exampleTypeReference.Base64)),
		}
	case "bigInteger":
		// TODO: Add support for BigInteger.
		return &ast.BasicLit{
			Value: fmt.Sprintf("%q", exampleTypeReference.BigInteger),
		}
	}
	return nil
}

func (s *SnippetWriter) isExampleUnionTypeLiteral(
	declaredTypeName *ir.DeclaredTypeName,
	exampleUnionType *ir.ExampleUnionType,
) bool {
	typeDeclaration := s.types[declaredTypeName.TypeId]
	if typeDeclaration == nil {
		// This should be unreachable.
		return false
	}
	switch typeDeclaration.Shape.Type {
	case "union":
		wireValue := exampleUnionType.SingleUnionType.WireDiscriminantValue.WireValue
		for _, singleUnionType := range typeDeclaration.Shape.Union.Types {
			if singleUnionType.DiscriminantValue.WireValue == wireValue {
				return singleUnionType.Shape.SingleProperty != nil && isTypeReferenceLiteral(singleUnionType.Shape.SingleProperty.Type)
			}
		}
	}
	return false
}

func (s *SnippetWriter) isExampleObjectPropertyLiteral(
	exampleObjectProperty *ir.ExampleObjectProperty,
) bool {
	typeDeclaration := s.types[exampleObjectProperty.OriginalTypeDeclaration.TypeId]
	if typeDeclaration == nil {
		// This should be unreachable.
		return false
	}
	switch typeDeclaration.Shape.Type {
	case "alias":
		return isTypeReferenceLiteral(typeDeclaration.Shape.Alias.AliasOf)
	case "object":
		wireValue := exampleObjectProperty.Name.WireValue
		for _, property := range typeDeclaration.Shape.Object.Properties {
			if property.Name.WireValue == wireValue {
				return isTypeReferenceLiteral(property.ValueType)
			}
		}
	}
	return false
}

func (s *SnippetWriter) getUndiscriminatedUnionMember(
	declaredTypeName *ir.DeclaredTypeName,
	exampleUndiscriminatedUnionType *ir.ExampleUndiscriminatedUnionType,
) *ir.UndiscriminatedUnionMember {
	undiscriminatedUnionType := s.getUndiscriminatedUnionTypeFromTypeName(declaredTypeName)
	if undiscriminatedUnionType == nil {
		// This should be unreachable.
		return nil
	}
	return undiscriminatedUnionType.Members[exampleUndiscriminatedUnionType.Index]
}

func (s *SnippetWriter) getUndiscriminatedUnionTypeFromTypeName(
	declaredTypeName *ir.DeclaredTypeName,
) *ir.UndiscriminatedUnionTypeDeclaration {
	typeDeclaration := s.types[declaredTypeName.TypeId]
	if typeDeclaration == nil {
		// This should be unreachable.
		return nil
	}
	switch typeDeclaration.Shape.Type {
	case "undiscriminatedUnion":
		return typeDeclaration.Shape.UndiscriminatedUnion
	}
	return nil
}

func (s *SnippetWriter) declaredTypeNameToImportedReference(
	declaredTypeName *ir.DeclaredTypeName,
) *ast.ImportedReference {
	return &ast.ImportedReference{
		ImportPath: fernFilepathToImportPath(s.baseImportPath, declaredTypeName.FernFilepath),
		Name:       declaredTypeName.Name.PascalCase.UnsafeName,
	}
}

func maybePrimitiveExampleTypeReferenceShape(
	exampleTypeReferenceShape *ir.ExampleTypeReferenceShape,
) *ir.ExamplePrimitive {
	switch exampleTypeReferenceShape.Type {
	case "primitive":
		return exampleTypeReferenceShape.Primitive
	case "container":
		if exampleTypeReferenceShape.Container.Nullable != nil {
			if exampleTypeReferenceShape.Container.Nullable.Nullable != nil {
				return maybePrimitiveExampleTypeReferenceShape(exampleTypeReferenceShape.Container.Nullable.Nullable.Shape)
			}
			return nil
		}
		if exampleTypeReferenceShape.Container.Optional != nil {
			if exampleTypeReferenceShape.Container.Optional.Optional != nil {
				return maybePrimitiveExampleTypeReferenceShape(exampleTypeReferenceShape.Container.Optional.Optional.Shape)
			}
			return nil
		}
	case "named":
		if exampleTypeReferenceShape.Named.Shape.Alias != nil {
			return maybePrimitiveExampleTypeReferenceShape(exampleTypeReferenceShape.Named.Shape.Alias.Value.Shape)
		}
	}
	return nil
}

func examplePrimitiveToPointerConstructorName(
	examplePrimitive *ir.ExamplePrimitive,
) string {
	switch examplePrimitive.Type {
	case "integer":
		return "Int"
	case "long":
		return "Int64"
	case "uint":
		// TODO: Add support for uint.
		return "Int"
	case "uint64":
		// TODO: Add support for uint64.
		return "Int64"
	case "float":
		// TODO: Add support for float32.
		return "Float64"
	case "double":
		return "Float64"
	case "boolean":
		return "Bool"
	case "string":
		return "String"
	case "date":
		return "Time"
	case "datetime":
		return "Time"
	case "uuid":
		return "UUID"
	case "base64":
		return "" // Unused
	case "bigInteger":
		// TODO: Add support for BigInteger.
		return "String"
	}
	return "Unknown"
}

func isTypeReferenceLiteral(typeReference *ir.TypeReference) bool {
	if typeReference.Container != nil {
		if typeReference.Container.Nullable != nil {
			return isTypeReferenceLiteral(typeReference.Container.Nullable)
		}
		if typeReference.Container.Optional != nil {
			return isTypeReferenceLiteral(typeReference.Container.Optional)
		}
		return typeReference.Container.Literal != nil
	}
	return false
}

// typeReferenceVisitor retrieves the string representation of type references
// (e.g. containers, primitives, etc).
type exampleTypeReferenceShapeVisitor struct {
	value ast.Expr

	baseImportPath string
	types          map[common.TypeId]*ir.TypeDeclaration
}

// exampleTypeReferenceToGoType maps the given type reference into its Go-equivalent.
func exampleTypeReferenceShapeToGoType(
	exampleTypeReferenceShape *ir.ExampleTypeReferenceShape,
	types map[common.TypeId]*ir.TypeDeclaration,
	baseImportPath string,
) ast.Expr {
	visitor := &exampleTypeReferenceShapeVisitor{
		baseImportPath: baseImportPath,
		types:          types,
	}
	_ = exampleTypeReferenceShape.Accept(visitor)
	return visitor.value
}

// Compile-time assertion.
var _ ir.ExampleTypeReferenceShapeVisitor = (*exampleTypeReferenceShapeVisitor)(nil)

func (e *exampleTypeReferenceShapeVisitor) VisitContainer(container *ir.ExampleContainer) error {
	e.value = exampleContainerTypeToGoType(
		container,
		e.types,
		e.baseImportPath,
	)
	return nil
}

func (e *exampleTypeReferenceShapeVisitor) VisitNamed(named *ir.ExampleNamedType) error {
	e.value = &ast.ImportedReference{
		Name:       named.TypeName.Name.PascalCase.UnsafeName,
		ImportPath: fernFilepathToImportPath(e.baseImportPath, named.TypeName.FernFilepath),
	}
	if isPointer(e.types[named.TypeName.TypeId]) {
		e.value = &ast.Optional{
			Expr: e.value,
		}
	}
	return nil
}

func (e *exampleTypeReferenceShapeVisitor) VisitPrimitive(primitive *ir.ExamplePrimitive) error {
	var primitiveType *ir.PrimitiveType
	switch primitive.Type {
	case "integer":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Integer}
	case "long":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Long}
	case "uint":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Uint}
	case "uint64":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Uint64}
	case "float":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Float}
	case "double":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Double}
	case "boolean":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Boolean}
	case "string":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1String}
	case "date":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Date}
	case "datetime":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1DateTime}
	case "uuid":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Uuid}
	case "base64":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1Base64}
	case "bigInteger":
		primitiveType = &ir.PrimitiveType{V1: common.PrimitiveTypeV1BigInteger}
	}
	e.value = &ast.BasicLit{
		Value: primitiveToGoType(primitiveType),
	}
	return nil
}

func (e *exampleTypeReferenceShapeVisitor) VisitUnknown(unknown any) error {
	e.value = &ast.BasicLit{
		Value: unknownToGoType(unknown),
	}
	return nil
}

type exampleContainerVisitor struct {
	value ast.Expr

	baseImportPath string
	types          map[common.TypeId]*ir.TypeDeclaration
}

func exampleContainerTypeToGoType(
	exampleContainer *ir.ExampleContainer,
	types map[common.TypeId]*ir.TypeDeclaration,
	baseImportPath string,
) ast.Expr {
	visitor := &exampleContainerVisitor{
		baseImportPath: baseImportPath,
		types:          types,
	}
	_ = exampleContainer.Accept(visitor)
	return visitor.value
}

// Compile-time assertion.
var _ ir.ExampleContainerVisitor = (*exampleContainerVisitor)(nil)

func (e *exampleContainerVisitor) VisitList(list *ir.ExampleListContainer) error {
	if list == nil || len(list.List) == 0 {
		// The example doesn't have enough information on its own.
		e.value = &ast.ArrayType{
			Expr: &ast.LocalReference{
				Name: "interface{}",
			},
		}
		return nil
	}
	e.value = exampleTypeReferenceShapeToGoType(
		list.List[0].Shape,
		e.types,
		e.baseImportPath,
	)
	return nil
}

func (e *exampleContainerVisitor) VisitSet(set *ir.ExampleSetContainer) error {
	if set == nil || len(set.Set) == 0 {
		// The example doesn't have enough information on its own.
		e.value = &ast.ArrayType{
			Expr: &ast.LocalReference{
				Name: "interface{}",
			},
		}
		return nil
	}
	e.value = exampleTypeReferenceShapeToGoType(
		set.Set[0].Shape,
		e.types,
		e.baseImportPath,
	)
	return nil
}

func (e *exampleContainerVisitor) VisitMap(mapContainer *ir.ExampleMapContainer) error {
	if mapContainer == nil || len(mapContainer.Map) == 0 {
		// The example doesn't have enough information on its own.
		e.value = &ast.MapType{
			Key: &ast.LocalReference{
				Name: "string",
			},
			Value: &ast.LocalReference{
				Name: "interface{}",
			},
		}
		return nil
	}
	pair := mapContainer.Map[0]

	e.value = &ast.MapType{
		Key: exampleTypeReferenceShapeToGoType(
			pair.Key.Shape,
			e.types,
			e.baseImportPath,
		),
		Value: exampleTypeReferenceShapeToGoType(
			pair.Value.Shape,
			e.types,
			e.baseImportPath,
		),
	}
	return nil
}

func (e *exampleContainerVisitor) VisitNullable(nullable *ir.ExampleNullableContainer) error {
	if nullable == nil || nullable.Nullable == nil {
		return nil
	}
	// Collapse nullable inside optional and treat as an optional
	shape := nullable.Nullable.Shape
	if nullable.Nullable.Shape.Container != nil && nullable.Nullable.Shape.Container.Optional != nil {
		shape = nullable.Nullable.Shape.Container.Optional.Optional.Shape
	}

	e.value = &ast.Optional{
		Expr: exampleTypeReferenceShapeToGoType(
			shape,
			e.types,
			e.baseImportPath,
		),
	}
	return nil
}

func (e *exampleContainerVisitor) VisitOptional(optional *ir.ExampleOptionalContainer) error {
	if optional == nil || optional.Optional == nil {
		return nil
	}
	// Collapse optional inside nullable and treat as an optional
	shape := optional.Optional.Shape
	if optional.Optional.Shape.Container != nil && optional.Optional.Shape.Container.Nullable != nil {
		shape = optional.Optional.Shape.Container.Nullable.Nullable.Shape
	}
	e.value = &ast.Optional{
		Expr: exampleTypeReferenceShapeToGoType(
			shape,
			e.types,
			e.baseImportPath,
		),
	}
	return nil
}

func (e *exampleContainerVisitor) VisitLiteral(literal *ir.ExampleLiteralContainer) error {
	if literal == nil {
		return nil
	}
	return nil
}
