package common

import (
	"encoding/json"
	"testing"
)

func TestFernFilepathWithStringNames(t *testing.T) {
	// v66 compressed format: allParts and packagePath contain plain strings
	data := []byte(`{"allParts":["src","models"],"packagePath":["src"],"file":"models"}`)
	var fp FernFilepath
	if err := json.Unmarshal(data, &fp); err != nil {
		t.Fatalf("UnmarshalJSON: %v", err)
	}
	if len(fp.AllParts) != 2 {
		t.Fatalf("AllParts length: got %d, want 2", len(fp.AllParts))
	}
	if fp.AllParts[0].OriginalName != "src" {
		t.Errorf("AllParts[0].OriginalName: got %q, want %q", fp.AllParts[0].OriginalName, "src")
	}
	if fp.AllParts[1].OriginalName != "models" {
		t.Errorf("AllParts[1].OriginalName: got %q, want %q", fp.AllParts[1].OriginalName, "models")
	}
	if fp.File == nil || fp.File.OriginalName != "models" {
		t.Errorf("File.OriginalName: got %v, want %q", fp.File, "models")
	}
}
