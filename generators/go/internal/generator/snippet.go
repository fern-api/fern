package generator

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/fern-api/fern-go/internal/ast"
	"github.com/fern-api/fern-go/internal/fern/ir"
)

// SnippetWriter writes codes snippets as AST expressions from examples.
type SnippetWriter struct {
	baseImportPath string
	types          map[ir.TypeId]*ir.TypeDeclaration
}

// NewSnippetWriter constructs a new *SnippetWriter.
func NewSnippetWriter(
	baseImportPath string,
	types map[ir.TypeId]*ir.TypeDeclaration,
) *SnippetWriter {
	return &SnippetWriter{
		baseImportPath: baseImportPath,
		types:          types,
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
				Key:   property.Name.Name.PascalCase.UnsafeName,
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
	var parameters []ast.Expr
	if parameter := s.getSnippetForExampleSingleUnionTypeProperties(exampleUnionType.SingleUnionType.Shape); parameter != nil {
		parameters = append(parameters, parameter)
	}
	if len(parameters) == 0 {
		// This union type doesn't have any properties, so we can just construct it
		// as an in-line struct.
		return &ast.StructType{
			Name: importedReference,
			Fields: []*ast.Field{
				{
					Key: exampleUnionType.Discriminant.Name.PascalCase.UnsafeName,
					Value: &ast.BasicLit{
						Value: fmt.Sprintf("%q", exampleUnionType.SingleUnionType.WireDiscriminantValue.Name.OriginalName),
					},
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
		Parameters: parameters,
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
	field := typeReferenceToUndiscriminatedUnionField(member.Type, s.types)
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
			s.GetSnippetForExampleTypeReference(exampleUndiscriminatedUnionType.SingleUnionType),
		},
	}
}

func (s *SnippetWriter) getSnippetForContainer(
	exampleContainer *ir.ExampleContainer,
) ast.Expr {
	switch exampleContainer.Type {
	case "list":
		return s.getSnippetForListOrSet(exampleContainer.List)
	case "set":
		return s.getSnippetForListOrSet(exampleContainer.List)
	case "optional":
		if exampleContainer.Optional == nil {
			return nil
		}
		return s.GetSnippetForExampleTypeReference(exampleContainer.Optional)
	case "map":
		return s.getSnippetForMap(exampleContainer.Map)
	}
	return nil
}

func (s *SnippetWriter) getSnippetForListOrSet(
	exampleTypeReferences []*ir.ExampleTypeReference,
) ast.Expr {
	var expressions []ast.Expr
	for _, exampleTypeReference := range exampleTypeReferences {
		expr := s.GetSnippetForExampleTypeReference(exampleTypeReference)
		if expr == nil {
			continue
		}
		expressions = append(expressions, expr)
	}
	if len(expressions) == 0 {
		return nil
	}
	return &ast.ArrayLit{
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
	return &ast.MapLit{
		Keys:   keys,
		Values: values,
	}
}

func (s *SnippetWriter) getSnippetForUnknown(
	unknownExample interface{},
) ast.Expr {
	// TODO: Add better support for unknown examples.
	//
	// nil is still a valid value, but it's
	// not the example provided by the user.
	return &ast.BasicLit{
		Value: "nil",
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
	case "double":
		return &ast.BasicLit{
			Value: strconv.FormatFloat(exampleTypeReference.Double, 'f', -1, 64),
		}
	case "string":
		value := fmt.Sprintf("%q", exampleTypeReference.String.Original)
		if strings.Contains(exampleTypeReference.String.Original, `"`) {
			value = fmt.Sprintf("`%s`", exampleTypeReference.String)
		}
		return &ast.BasicLit{
			Value: value,
		}
	case "boolean":
		return &ast.BasicLit{
			Value: strconv.FormatBool(exampleTypeReference.Boolean),
		}
	case "long":
		return &ast.BasicLit{
			Value: strconv.FormatInt(exampleTypeReference.Long, 64),
		}
	case "datetime":
		return &ast.BasicLit{
			Value: fmt.Sprintf("%q", exampleTypeReference.Datetime.Format(time.RFC3339)),
		}
	case "date":
		return &ast.BasicLit{
			Value: fmt.Sprintf("%q", exampleTypeReference.Date.Format("2006-01-02")),
		}
	case "uuid":
		return &ast.BasicLit{
			Value: fmt.Sprintf("%q", exampleTypeReference.Uuid.String()),
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

func isTypeReferenceLiteral(typeReference *ir.TypeReference) bool {
	if typeReference.Container != nil {
		if typeReference.Container.Optional != nil {
			return isTypeReferenceLiteral(typeReference)
		}
		return typeReference.Container.Literal != nil
	}
	return false
}
