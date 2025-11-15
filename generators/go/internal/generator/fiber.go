package generator

import (
	_ "embed"
	"fmt"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// WriteFiberRequestType writes a Fiber-compatible type dedicated to the in-lined request (if any).
// This allows QueryParser to correctly interpret generated query parameter types.
func (f *fileWriter) WriteFiberRequestType(fernFilepath *common.FernFilepath, endpoint *ir.HttpEndpoint, includeGenericOptionals bool) error {
	var (
		// At this point, we've already verified that the given endpoint's request
		// is a wrapper, so we can safely access it without any nil-checks.
		bodyField = endpoint.SdkRequest.Shape.Wrapper.BodyKey.PascalCase.UnsafeName
		typeName  = endpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName
		receiver  = typeNameToReceiver(typeName)
	)
	importPath := getImportPathForRequestType(f, fernFilepath)

	var literals []*literal
	f.P("type ", typeName, " struct {")
	for _, header := range endpoint.Headers {
		f.WriteDocs(header.Docs)
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			literals = append(
				literals,
				&literal{
					Name:  header.Name,
					Value: header.ValueType.Container.Literal,
				},
			)
			continue
		}
		goType := typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		f.P(header.Name.Name.PascalCase.UnsafeName, " ", goType, " `header:\"", header.Name.Name.OriginalName, "\"`")
	}
	for _, queryParam := range endpoint.QueryParameters {
		value := typeReferenceToGoType(queryParam.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		if queryParam.AllowMultiple {
			value = fmt.Sprintf("[]%s", value)
		}
		f.WriteDocs(queryParam.Docs)
		if queryParam.ValueType.Container != nil && queryParam.ValueType.Container.Literal != nil {
			literals = append(
				literals,
				&literal{
					Name:  queryParam.Name,
					Value: queryParam.ValueType.Container.Literal,
				},
			)
			continue
		}
		f.P(queryParam.Name.Name.PascalCase.UnsafeName, " ", value, " `query:\"", queryParam.Name.Name.OriginalName, "\"`")
	}
	if endpoint.RequestBody == nil {
		// If the request doesn't have a body, we don't need any custom [de]serialization logic.
		for _, literal := range literals {
			f.P(literal.Name.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
		}
		f.P("}")
		f.P()
		for _, literal := range literals {
			f.P("func (", receiver, " *", typeName, ") ", literal.Name.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
			f.P("return ", receiver, ".", literal.Name.Name.CamelCase.SafeName)
			f.P("}")
			f.P()
		}
		return nil
	}
	requestBody, err := requestBodyToFieldDeclaration(endpoint.RequestBody, f, importPath, bodyField, includeGenericOptionals, false /* inlineFileProperties */)
	if err != nil {
		return err
	}
	literals = append(literals, requestBody.literals...)
	for _, literal := range literals {
		f.P(literal.Name.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
	}
	f.P("}")
	f.P()
	// Implement the getter methods.
	for _, literal := range literals {
		f.P("func (", receiver, " *", typeName, ") ", literal.Name.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
		f.P("return ", receiver, ".", literal.Name.Name.CamelCase.SafeName)
		f.P("}")
		f.P()
	}

	var (
		referenceType            string
		referenceIsPointer       bool
		referenceFieldIsPointer  bool
		referenceLiteral         string
	)
	if reference := endpoint.RequestBody.Reference; reference != nil {
		fullType := typeReferenceToGoType(reference.RequestBodyType, f.types, f.scope, f.baseImportPath, importPath, false)
		referenceFieldIsPointer = strings.HasPrefix(fullType, "*")
		referenceType = strings.TrimPrefix(fullType, "*")
		referenceIsPointer = reference.RequestBodyType.Named != nil && isPointer(f.types[reference.RequestBodyType.Named.TypeId])
		if reference.RequestBodyType.Container != nil && reference.RequestBodyType.Container.Literal != nil {
			referenceLiteral = literalToValue(reference.RequestBodyType.Container.Literal)
		}
	}

	if len(literals) == 0 && len(referenceType) == 0 {
		// If the request doesn't specify any literals or a reference type,
		// we don't need to customize the [de]serialization logic at all.
		return nil
	}

	// Implement the json.Unmarshaler interface.
	f.P("func (", receiver, " *", typeName, ") UnmarshalJSON(data []byte) error {")
	if len(referenceType) > 0 {
		if referenceIsPointer {
			f.P("body := new(", referenceType, ")")
		} else {
			f.P("var body ", referenceType)
		}
	} else {
		f.P("type unmarshaler ", typeName)
		f.P("var body unmarshaler")
	}
	f.P("if err := json.Unmarshal(data, &body); err != nil {")
	f.P("return err")
	f.P("}")
	if len(referenceType) > 0 {
		if len(referenceLiteral) > 0 {
			f.P("if body != ", referenceLiteral, "{")
			f.P(`return fmt.Errorf("expected literal %q, but found %q", `, referenceLiteral, ", body)")
			f.P("}")
		}
		bodyValue := "body"
		if referenceFieldIsPointer && !referenceIsPointer {
			bodyValue = "&body"
		}
		f.P(receiver, ".", bodyField, " = ", bodyValue)
	} else {
		f.P("*", receiver, " = ", typeName, "(body)")
	}
	for _, literal := range literals {
		f.P(receiver, ".", literal.Name.Name.CamelCase.SafeName, " = ", literalToValue(literal.Value))
	}
	f.P("return nil")
	f.P("}")
	f.P()

	// Implement the json.Marshaler interface.
	f.P("func (", receiver, " *", typeName, ") MarshalJSON() ([]byte, error) {")
	if len(referenceType) > 0 {
		// If the request body is a reference type, we only need to marshal the body.
		value := fmt.Sprintf("%s.%s", receiver, bodyField)
		if len(referenceLiteral) > 0 {
			value = referenceLiteral
		}
		f.P("return json.Marshal(", value, ")")
	} else {
		f.P("type embed ", typeName)
		f.P("var marshaler = struct{")
		f.P("embed")
		for _, literal := range literals {
			f.P(literal.Name.Name.PascalCase.UnsafeName, " ", literalToGoType(literal.Value), " `json:\"", literal.Name.WireValue, "\"`")
		}
		f.P("}{")
		f.P("embed: embed(*", receiver, "),")
		for _, literal := range literals {
			f.P(literal.Name.Name.PascalCase.UnsafeName, ": ", literalToValue(literal.Value), ",")
		}
		f.P("}")
		f.P("return json.Marshal(marshaler)")
	}
	f.P("}")
	f.P()

	return nil
}
