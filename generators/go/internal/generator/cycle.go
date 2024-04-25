package generator

import (
	"fmt"
	"sort"

	fernir "github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/hmdsefi/gograph"
	"github.com/hmdsefi/gograph/connectivity"
)

// Package is used for readability for now.
type PackageName = string

// CycleInfo will eventually exist in the IR definition.
type CycleInfo struct {
	RecursiveTypes []fernir.TypeId
	LeafTypes      []fernir.TypeId
}

func cycleInfoFromIR(ir *fernir.IntermediateRepresentation, baseImportPath string) (*CycleInfo, error) {
	var (
		typeToPackage  = make(map[fernir.TypeId]PackageName)
		packageToTypes = make(map[PackageName][]*fernir.TypeDeclaration)
	)
	typeList := make([]*fernir.TypeDeclaration, 0, len(ir.Types))
	for typeId, typeDecl := range ir.Types {
		packageName := fernFilepathToImportPath(
			baseImportPath,
			typeDecl.Name.FernFilepath,
		)
		typeToPackage[typeId] = packageName
		typeList = append(typeList, typeDecl)
		packageToTypes[packageName] = append(packageToTypes[packageName], typeDecl)
	}
	sort.Slice(typeList, func(i, j int) bool { return typeList[i].Name.TypeId < typeList[j].Name.TypeId })
	// Create a graph, where ever node is represented by a fernir.TypeId,
	// and each edge is defined by a reference between two types.
	typeGraph, err := typeGraphFromTypes(typeList)
	if err != nil {
		return nil, err
	}
	// Sort all of the package to types lists for deterministic results.
	for _, typeDecls := range packageToTypes {
		sort.Slice(
			typeDecls,
			func(i, j int) bool {
				return typeGraph.GetVertexByID(typeDecls[i].Name.TypeId).Label() < typeGraph.GetVertexByID(typeDecls[j].Name.TypeId).Label()
			},
		)
	}
	packageGraph, err := packageGraphFromTypes(typeList, typeToPackage)
	if err != nil {
		return nil, err
	}
	// Then find all the strongly connected components that need to be resolved.
	invalidComponents := invalidComponentsFromGraph(packageGraph)
	if len(invalidComponents) == 0 {
		return nil, nil
	}
	var cycleInfos []*CycleInfo
	for _, invalidComponent := range invalidComponents {
		cycleInfo, err := resolveCycleForComponent(
			ir.Types,
			typeGraph,
			typeToPackage,
			packageToTypes,
			invalidComponent,
		)
		if err != nil {
			return nil, err
		}
		cycleInfos = append(cycleInfos, cycleInfo)
	}
	var (
		leafTypeMap      = make(map[fernir.TypeId]struct{})
		recursiveTypeMap = make(map[fernir.TypeId]struct{})
	)
	for _, cycleInfo := range cycleInfos {
		for _, leafType := range cycleInfo.LeafTypes {
			leafTypeMap[leafType] = struct{}{}
		}
		for _, recursiveType := range cycleInfo.RecursiveTypes {
			recursiveTypeMap[recursiveType] = struct{}{}
		}
	}
	cycleInfo := &CycleInfo{
		LeafTypes:      stringSetToSortedSlice(leafTypeMap),
		RecursiveTypes: stringSetToSortedSlice(recursiveTypeMap),
	}
	return cycleInfo, nil
}

func typeGraphFromTypes(
	types []*fernir.TypeDeclaration,
) (gograph.Graph[fernir.TypeId], error) {
	graph := gograph.New[fernir.TypeId](gograph.Directed())
	for _, irType := range types {
		from := graph.AddVertexByLabel(irType.Name.TypeId)
		if from == nil {
			from = graph.GetVertexByID(irType.Name.TypeId)
		}
		for _, irReferencedTypeID := range irType.ReferencedTypes {
			to := graph.AddVertexByLabel(irReferencedTypeID)
			if to == nil {
				to = graph.GetVertexByID(irReferencedTypeID)
			}

			if graph.GetEdge(from, to) == nil {
				if _, err := graph.AddEdge(from, to); err != nil {
					return nil, err
				}
			}
		}
	}
	return graph, nil
}

func packageGraphFromTypes(
	types []*fernir.TypeDeclaration,
	typeToPackage map[fernir.TypeId]PackageName,
) (gograph.Graph[PackageName], error) {
	graph := gograph.New[PackageName](gograph.Directed())
	for _, irType := range types {
		fromPackageName := typeToPackage[irType.Name.TypeId]

		from := graph.AddVertexByLabel(fromPackageName)
		if from == nil {
			from = graph.GetVertexByID(fromPackageName)
		}

		for _, irReferencedTypeID := range irType.ReferencedTypes {
			toPackageName := typeToPackage[irReferencedTypeID]

			to := graph.AddVertexByLabel(toPackageName)
			if to == nil {
				to = graph.GetVertexByID(toPackageName)
			}

			if graph.GetEdge(from, to) == nil {
				if _, err := graph.AddEdge(from, to); err != nil {
					return nil, err
				}
			}
		}
	}
	return graph, nil
}

func invalidComponentsFromGraph(
	graph gograph.Graph[PackageName],
) [][]*gograph.Vertex[PackageName] {
	connectedComponents := connectivity.Kosaraju[PackageName](graph)
	var invalidComponents [][]*gograph.Vertex[PackageName]
	for _, component := range connectedComponents {
		if len(component) == 1 {
			continue
		}
		// Sort for determinisitc results.
		sort.Slice(component, func(i, j int) bool { return component[i].Label() < component[j].Label() })
		invalidComponents = append(invalidComponents, component)
	}
	return invalidComponents
}

func resolveCycleForComponent(
	types map[fernir.TypeId]*fernir.TypeDeclaration,
	typeGraph gograph.Graph[fernir.TypeId],
	typeToPackage map[fernir.TypeId]PackageName,
	packageToTypes map[PackageName][]*fernir.TypeDeclaration,
	component []*gograph.Vertex[PackageName],
) (*CycleInfo, error) {
	componentPackageNames := make(map[PackageName]struct{})
	for _, vertex := range component {
		componentPackageNames[vertex.Label()] = struct{}{}
	}
	var (
		leafTypeMap      = make(map[fernir.TypeId]struct{})
		recursiveTypeMap = make(map[fernir.TypeId]struct{})
	)
	for _, vertex := range component {
		typeDecls, ok := packageToTypes[vertex.Label()]
		if !ok {
			return nil, fmt.Errorf("internal: type %s was not assigned to a package", vertex.Label())
		}
		for _, typeDecl := range typeDecls {
			if _, ok := leafTypeMap[typeDecl.Name.TypeId]; ok {
				// This type has already been categorized.
				continue
			}
			if _, ok := recursiveTypeMap[typeDecl.Name.TypeId]; ok {
				// This type has already been categorized.
				continue
			}
			currentTypeVertex := typeGraph.GetVertexByID(typeDecl.Name.TypeId)
			currentTypePackage := typeToPackage[typeDecl.Name.TypeId]
			// If this type only has incoming edges from other packages, it is considered
			// a leaf type.
			var hasExternalIncomingEdges bool
			for _, currentTypeEdge := range typeGraph.EdgesOf(currentTypeVertex) {
				otherTypeVertex := currentTypeEdge.OtherVertex(currentTypeVertex.Label())
				otherTypePackage := typeToPackage[otherTypeVertex.Label()]
				if _, ok := componentPackageNames[otherTypePackage]; !ok || currentTypePackage == otherTypePackage {
					// This dependency is permissible because either:
					//
					//  1. The edge exists within the same package.
					//  2. The edge exists between a package not included in the SCC.
					//
					continue
				}
				hasExternalIncomingEdges = hasExternalIncomingEdges || currentTypeEdge.Destination() == currentTypeVertex
			}
			if !hasExternalIncomingEdges {
				// This type only has dependencies within the same package or
				// only depends on types from other packages (i.e. it can
				// stay where it is).
				continue
			}
			typeIds := referencedTypeIdsForType(
				types,
				typeToPackage,
				typeDecl,
				componentPackageNames,
			)
			for _, typeId := range typeIds {
				leafTypeMap[typeId] = struct{}{}
			}
		}
	}
	// TODO: At this point, we've collected all the leaf types into a single set.
	// Now we should repeat the algorithm, but only on these candidate types. If any
	// of the types compose a SCC, then they need to be moved into a root common package,
	// aka the "recursive" types.
	return &CycleInfo{
		RecursiveTypes: stringSetToSortedSlice(recursiveTypeMap),
		LeafTypes:      stringSetToSortedSlice(leafTypeMap),
	}, nil
}

func referencedTypeIdsForType(
	types map[fernir.TypeId]*fernir.TypeDeclaration,
	typeToPackage map[fernir.TypeId]PackageName,
	typeDecl *fernir.TypeDeclaration,
	componentPackageNames map[PackageName]struct{},
) []string {
	result := make(map[string]struct{})
	referencedTypeIdsForTypeRecurse(
		types,
		typeToPackage,
		typeDecl,
		componentPackageNames,
		result,
	)
	return stringSetToSortedSlice(result)
}

func referencedTypeIdsForTypeRecurse(
	types map[fernir.TypeId]*fernir.TypeDeclaration,
	typeToPackage map[fernir.TypeId]PackageName,
	typeDecl *fernir.TypeDeclaration,
	componentPackageNames map[PackageName]struct{},
	result map[string]struct{},
) {
	if _, ok := result[typeDecl.Name.TypeId]; ok {
		return
	}
	result[typeDecl.Name.TypeId] = struct{}{}
	for _, referencedTypeID := range typeDecl.ReferencedTypes {
		packageName := typeToPackage[referencedTypeID]
		if _, ok := componentPackageNames[packageName]; !ok {
			// The referenced type isn't included in the SCC, so
			// we can ignore it (and its descendants).
			continue
		}
		referencedTypeIdsForTypeRecurse(
			types,
			typeToPackage,
			types[referencedTypeID],
			componentPackageNames,
			result,
		)
	}
}

// replaceFilepathForType crawls throughout the entire IR, replacing
// every reference of the given TypeId to use the given FernFilepath.
func replaceFilepathForTypeInIR(
	ir *fernir.IntermediateRepresentation,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if ir.Auth != nil {
		for _, irScheme := range ir.Auth.Schemes {
			if irScheme.Header != nil && irScheme.Header.ValueType != nil {
				replaceFilepathForTypeInTypeReference(
					irScheme.Header.ValueType,
					typeId,
					fernFilepath,
				)
			}
		}
	}
	for _, irHeader := range ir.Headers {
		replaceFilepathForTypeInTypeReference(
			irHeader.ValueType,
			typeId,
			fernFilepath,
		)
	}
	for _, irType := range ir.Types {
		replaceFilepathForTypeInDeclaredTypeName(
			irType.Name,
			typeId,
			fernFilepath,
		)
		if irType.Shape != nil {
			replaceFilepathForTypeInType(
				irType.Shape,
				typeId,
				fernFilepath,
			)
		}
		for _, referencedType := range declaredTypeNamesForTypeIDs(ir, irType.ReferencedTypes) {
			replaceFilepathForTypeInDeclaredTypeName(
				referencedType,
				typeId,
				fernFilepath,
			)
		}
	}
	for _, irService := range ir.Services {
		for _, irEndpoint := range irService.Endpoints {
			for _, irHeader := range irEndpoint.Headers {
				replaceFilepathForTypeInTypeReference(
					irHeader.ValueType,
					typeId,
					fernFilepath,
				)
			}
			for _, irPathParameter := range irEndpoint.PathParameters {
				replaceFilepathForTypeInTypeReference(
					irPathParameter.ValueType,
					typeId,
					fernFilepath,
				)
			}
			for _, irPathParameter := range irEndpoint.AllPathParameters {
				replaceFilepathForTypeInTypeReference(
					irPathParameter.ValueType,
					typeId,
					fernFilepath,
				)
			}
			for _, irQueryParameter := range irEndpoint.QueryParameters {
				replaceFilepathForTypeInTypeReference(
					irQueryParameter.ValueType,
					typeId,
					fernFilepath,
				)
			}
			if irEndpoint.RequestBody != nil {
				replaceFilepathForTypeInHttpRequestBody(irEndpoint.RequestBody, typeId, fernFilepath)
			}
			if irEndpoint.SdkRequest != nil && irEndpoint.SdkRequest.Shape != nil && irEndpoint.SdkRequest.Shape.JustRequestBody != nil {
				replaceFilepathForTypeInTypeReference(irEndpoint.SdkRequest.Shape.JustRequestBody.TypeReference.RequestBodyType, typeId, fernFilepath)
			}
			if irEndpoint.Response != nil {
				replaceFilepathForTypeInHttpResponse(irEndpoint.Response, typeId, fernFilepath)
			}
		}
	}
	for _, irError := range ir.Errors {
		replaceFilepathForTypeInTypeReference(irError.Type, typeId, fernFilepath)
	}
	for _, irPathParameter := range ir.PathParameters {
		replaceFilepathForTypeInTypeReference(irPathParameter.ValueType, typeId, fernFilepath)
	}
	for _, irVariable := range ir.Variables {
		replaceFilepathForTypeInTypeReference(irVariable.Type, typeId, fernFilepath)
	}
}

func replaceFilepathForTypeInHttpRequestBody(
	httpRequestBody *fernir.HttpRequestBody,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if httpRequestBody.InlinedRequestBody != nil {
		for _, extend := range httpRequestBody.InlinedRequestBody.Extends {
			replaceFilepathForTypeInDeclaredTypeName(extend, typeId, fernFilepath)
		}
		for _, property := range httpRequestBody.InlinedRequestBody.Properties {
			replaceFilepathForTypeInTypeReference(property.ValueType, typeId, fernFilepath)
		}
	}
	if httpRequestBody.Reference != nil {
		replaceFilepathForTypeInTypeReference(httpRequestBody.Reference.RequestBodyType, typeId, fernFilepath)
	}
	if httpRequestBody.FileUpload != nil {
		for _, property := range httpRequestBody.FileUpload.Properties {
			if property.BodyProperty != nil {
				replaceFilepathForTypeInTypeReference(property.BodyProperty.ValueType, typeId, fernFilepath)
			}
		}
	}
}

func replaceFilepathForTypeInHttpResponse(
	httpResponse *fernir.HttpResponse,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if httpResponse.Json != nil {
		if typeReference := typeReferenceFromJsonResponse(httpResponse.Json); typeReference != nil {
			replaceFilepathForTypeInTypeReference(typeReference, typeId, fernFilepath)
		}
	}
	if httpResponse.Streaming != nil {
		if httpResponse.Streaming.Json != nil {
			replaceFilepathForTypeInTypeReference(httpResponse.Streaming.Json.Payload, typeId, fernFilepath)
		}
		if httpResponse.Streaming.Sse != nil {
			replaceFilepathForTypeInTypeReference(httpResponse.Streaming.Sse.Payload, typeId, fernFilepath)
		}
	}
}

func replaceFilepathForTypeInType(
	irType *fernir.Type,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if alias := irType.Alias; alias != nil {
		replaceFilepathForTypeInTypeReference(alias.AliasOf, typeId, fernFilepath)
		replaceFilepathForTypeInResolvedTypeReference(alias.ResolvedType, typeId, fernFilepath)
	}
	if object := irType.Object; object != nil {
		for _, extend := range object.Extends {
			replaceFilepathForTypeInDeclaredTypeName(extend, typeId, fernFilepath)
		}
		for _, property := range object.Properties {
			replaceFilepathForTypeInTypeReference(property.ValueType, typeId, fernFilepath)
		}
	}
	if union := irType.Union; union != nil {
		for _, extend := range union.Extends {
			replaceFilepathForTypeInDeclaredTypeName(extend, typeId, fernFilepath)
		}
		for _, singleUnionType := range union.Types {
			properties := singleUnionType.Shape
			if properties.SamePropertiesAsObject != nil {
				replaceFilepathForTypeInDeclaredTypeName(properties.SamePropertiesAsObject, typeId, fernFilepath)
			}
			if properties.SingleProperty != nil {
				replaceFilepathForTypeInTypeReference(properties.SingleProperty.Type, typeId, fernFilepath)
			}
		}
		for _, property := range union.BaseProperties {
			replaceFilepathForTypeInTypeReference(property.ValueType, typeId, fernFilepath)
		}
	}
	if undiscriminatedUnion := irType.UndiscriminatedUnion; undiscriminatedUnion != nil {
		for _, member := range undiscriminatedUnion.Members {
			replaceFilepathForTypeInTypeReference(member.Type, typeId, fernFilepath)
		}
	}
	return
}

func replaceFilepathForTypeInResolvedTypeReference(
	resolvedTypeReference *fernir.ResolvedTypeReference,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if container := resolvedTypeReference.Container; container != nil {
		replaceFilepathForTypeInContainer(container, typeId, fernFilepath)
	}
	if resolvedTypeReference.Named != nil && resolvedTypeReference.Named.Name.TypeId == typeId {
		resolvedTypeReference.Named.Name.FernFilepath = fernFilepath
	}
}

func replaceFilepathForTypeInTypeReference(
	typeReference *fernir.TypeReference,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if container := typeReference.Container; container != nil {
		replaceFilepathForTypeInContainer(container, typeId, fernFilepath)
	}
	if typeReference.Named != nil && typeReference.Named.TypeId == typeId {
		typeReference.Named.FernFilepath = fernFilepath
	}
}

func replaceFilepathForTypeInContainer(
	container *fernir.ContainerType,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if container.List != nil {
		replaceFilepathForTypeInTypeReference(container.List, typeId, fernFilepath)
	}
	if container.Map != nil {
		replaceFilepathForTypeInTypeReference(container.Map.KeyType, typeId, fernFilepath)
		replaceFilepathForTypeInTypeReference(container.Map.ValueType, typeId, fernFilepath)
	}
	if container.Optional != nil {
		replaceFilepathForTypeInTypeReference(container.Optional, typeId, fernFilepath)
	}
	if container.Set != nil {
		replaceFilepathForTypeInTypeReference(container.Set, typeId, fernFilepath)
	}
}

func replaceFilepathForTypeInDeclaredTypeName(
	declaredTypeName *fernir.DeclaredTypeName,
	typeId fernir.TypeId,
	fernFilepath *fernir.FernFilepath,
) {
	if declaredTypeName.TypeId == typeId {
		declaredTypeName.FernFilepath = fernFilepath
	}
}

// commonPackageElement is prepended to all of the leaf types'
// FernFilepath so that they're deposited in a common, shared
// package.
var commonPackageElement = &fernir.Name{
	OriginalName: "common",
	CamelCase: &fernir.SafeAndUnsafeString{
		UnsafeName: "common",
		SafeName:   "common",
	},
	PascalCase: &fernir.SafeAndUnsafeString{
		UnsafeName: "Common",
		SafeName:   "Common",
	},
	SnakeCase: &fernir.SafeAndUnsafeString{
		UnsafeName: "common",
		SafeName:   "common",
	},
	ScreamingSnakeCase: &fernir.SafeAndUnsafeString{
		UnsafeName: "COMMON",
		SafeName:   "COMMON",
	},
}
