package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
	"github.com/stretchr/testify/assert"
)

func xmlLayoutTypeDeclaration(name string, snakeName string, packagePath []string, xml bool) *ir.TypeDeclaration {
	var packages []*common.Name
	for _, pkg := range packagePath {
		packages = append(packages, &common.Name{CamelCase: &common.SafeAndUnsafeString{UnsafeName: pkg, SafeName: pkg}})
	}
	declaration := &ir.TypeDeclaration{
		Name: &ir.DeclaredTypeName{
			TypeId: common.TypeId("type_" + name),
			Name: &common.Name{
				PascalCase: &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
				SnakeCase:  &common.SafeAndUnsafeString{UnsafeName: snakeName, SafeName: snakeName},
			},
			FernFilepath: &common.FernFilepath{PackagePath: packages},
		},
		Shape: &ir.Type{Object: &ir.ObjectTypeDeclaration{}},
	}
	if xml {
		declaration.Encoding = &ir.Encoding{Xml: &ir.XmlEncoding{Name: name}}
	}
	return declaration
}

func TestFileInfoForTypeDeclarationXmlLayout(t *testing.T) {
	for _, tc := range []struct {
		name        string
		declaration *ir.TypeDeclaration
		want        fileInfo
	}{
		{
			name:        "json type stays in the shared types file",
			declaration: xmlLayoutTypeDeclaration("Say", "say", []string{"twimlVoice"}, false),
			want:        fileInfo{filename: "twimlvoice/types.go", packageName: "twimlvoice"},
		},
		{
			name:        "xml type in a subpackage gets its own file",
			declaration: xmlLayoutTypeDeclaration("Say", "say", []string{"twimlVoice"}, true),
			want:        fileInfo{filename: "twimlvoice/say.go", packageName: "twimlvoice"},
		},
		{
			name:        "xml type in the root package gets its own file",
			declaration: xmlLayoutTypeDeclaration("VoiceResponse", "voice_response", nil, true),
			want:        fileInfo{filename: "voice_response.go", packageName: "acme"},
		},
		{
			name:        "xml type named like a reserved file stays in the shared types file",
			declaration: xmlLayoutTypeDeclaration("Client", "client", []string{"twimlVoice"}, true),
			want:        fileInfo{filename: "twimlvoice/types.go", packageName: "twimlvoice"},
		},
		{
			name:        "xml type named like the package docs file stays in the shared types file",
			declaration: xmlLayoutTypeDeclaration("Doc", "doc", nil, true),
			want:        fileInfo{filename: "types.go", packageName: "acme"},
		},
		{
			name:        "xml type whose file would be a Go test file stays in the shared types file",
			declaration: xmlLayoutTypeDeclaration("LoadTest", "load_test", nil, true),
			want:        fileInfo{filename: "types.go", packageName: "acme"},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, fileInfoForTypeDeclaration("acme", tc.declaration))
		})
	}
}

func TestFileInfoToTypesXmlLayout(t *testing.T) {
	say := xmlLayoutTypeDeclaration("Say", "say", []string{"twimlVoice"}, true)
	pause := xmlLayoutTypeDeclaration("Pause", "pause", []string{"twimlVoice"}, true)
	voice := xmlLayoutTypeDeclaration("SayVoice", "say_voice", []string{"twimlVoice"}, false)
	types := map[common.TypeId]*ir.TypeDeclaration{
		say.Name.TypeId:   say,
		pause.Name.TypeId: pause,
		voice.Name.TypeId: voice,
	}
	referenceInfo := &ir.ServiceTypeReferenceInfo{
		SharedTypes:                  []common.TypeId{say.Name.TypeId, pause.Name.TypeId, voice.Name.TypeId},
		TypesReferencedOnlyByService: map[ir.ServiceId][]common.TypeId{},
	}
	for _, info := range []*ir.ServiceTypeReferenceInfo{nil, referenceInfo} {
		result, err := fileInfoToTypes("acme", types, nil, info, false, false, false, false)
		assert.NoError(t, err)
		got := map[string][]string{}
		for fileInfo, typesToGenerate := range result {
			for _, typeToGenerate := range typesToGenerate {
				got[fileInfo.filename] = append(got[fileInfo.filename], typeToGenerate.ID)
			}
		}
		assert.Equal(t, map[string][]string{
			"twimlvoice/say.go":   {"type_Say"},
			"twimlvoice/pause.go": {"type_Pause"},
			"twimlvoice/types.go": {"type_SayVoice"},
		}, got)
	}
}
