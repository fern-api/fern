package common

import (
	"encoding/json"
	"testing"
)

func TestNameFromStringNoSmartCasing(t *testing.T) {
	// Default: smartCasing=false (matches seed test behavior)
	resetCasingConfig()

	tests := []struct {
		input         string
		wantOriginal  string
		wantCamel     string
		wantPascal    string
		wantSnake     string
		wantScreaming string
	}{
		// No initialisms applied when smartCasing is false
		{"userId", "userId", "userId", "UserId", "user_id", "USER_ID"},
		{"httpRequest", "httpRequest", "httpRequest", "HttpRequest", "http_request", "HTTP_REQUEST"},
		{"simple", "simple", "simple", "Simple", "simple", "SIMPLE"},
		{"myApiKey", "myApiKey", "myApiKey", "MyApiKey", "my_api_key", "MY_API_KEY"},
		{"getUrl", "getUrl", "getUrl", "GetUrl", "get_url", "GET_URL"},
		{"user_name", "user_name", "userName", "UserName", "user_name", "USER_NAME"},
		{"type", "type", "type_", "Type", "type_", "TYPE"},
		// Standard snake_case separates digits: EC2 -> ec_2
		{"EC2", "EC2", "ec2", "Ec2", "ec_2", "EC_2"},
		{"S3", "S3", "s3", "S3", "s_3", "S_3"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			n := nameFromString(tt.input)
			if n.OriginalName != tt.wantOriginal {
				t.Errorf("OriginalName: got %q, want %q", n.OriginalName, tt.wantOriginal)
			}
			if n.CamelCase.SafeName != tt.wantCamel {
				t.Errorf("CamelCase.SafeName: got %q, want %q", n.CamelCase.SafeName, tt.wantCamel)
			}
			if n.PascalCase.UnsafeName != tt.wantPascal {
				t.Errorf("PascalCase.UnsafeName: got %q, want %q", n.PascalCase.UnsafeName, tt.wantPascal)
			}
			if n.SnakeCase.SafeName != tt.wantSnake {
				t.Errorf("SnakeCase.SafeName: got %q, want %q", n.SnakeCase.SafeName, tt.wantSnake)
			}
			if n.ScreamingSnakeCase.UnsafeName != tt.wantScreaming {
				t.Errorf("ScreamingSnakeCase.UnsafeName: got %q, want %q", n.ScreamingSnakeCase.UnsafeName, tt.wantScreaming)
			}
		})
	}
}

func TestNameFromStringSmartCasing(t *testing.T) {
	// smartCasing=true with generationLanguage="go" (Go is in CAPITALIZE_INITIALISM)
	resetCasingConfig()
	ConfigureCasing(true, "go")

	tests := []struct {
		input         string
		wantOriginal  string
		wantCamel     string
		wantPascal    string
		wantSnake     string
		wantScreaming string
	}{
		{"userId", "userId", "userID", "UserID", "user_id", "USER_ID"},
		{"httpRequest", "httpRequest", "httpRequest", "HTTPRequest", "http_request", "HTTP_REQUEST"},
		{"simple", "simple", "simple", "Simple", "simple", "SIMPLE"},
		{"myApiKey", "myApiKey", "myAPIKey", "MyAPIKey", "my_api_key", "MY_API_KEY"},
		{"getUrl", "getUrl", "getURL", "GetURL", "get_url", "GET_URL"},
		{"user_name", "user_name", "userName", "UserName", "user_name", "USER_NAME"},
		{"type", "type", "type_", "Type", "type_", "TYPE"},
		// Uppercase runs followed by lowercase (the splitWords bug fix)
		{"myAPIKey", "myAPIKey", "myAPIKey", "MyAPIKey", "my_api_key", "MY_API_KEY"},
		{"XMLParsing", "XMLParsing", "xmlParsing", "XMLParsing", "xml_parsing", "XML_PARSING"},
		{"getHTTPSConnection", "getHTTPSConnection", "getHTTPSConnection", "GetHTTPSConnection", "get_https_connection", "GET_HTTPS_CONNECTION"},
		// Smart snake_case keeps digits attached: EC2 -> ec2
		{"EC2", "EC2", "ec2", "Ec2", "ec2", "EC2"},
		{"S3", "S3", "s3", "S3", "s3", "S3"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			n := nameFromString(tt.input)
			if n.OriginalName != tt.wantOriginal {
				t.Errorf("OriginalName: got %q, want %q", n.OriginalName, tt.wantOriginal)
			}
			if n.CamelCase.SafeName != tt.wantCamel {
				t.Errorf("CamelCase.SafeName: got %q, want %q", n.CamelCase.SafeName, tt.wantCamel)
			}
			if n.PascalCase.UnsafeName != tt.wantPascal {
				t.Errorf("PascalCase.UnsafeName: got %q, want %q", n.PascalCase.UnsafeName, tt.wantPascal)
			}
			if n.SnakeCase.SafeName != tt.wantSnake {
				t.Errorf("SnakeCase.SafeName: got %q, want %q", n.SnakeCase.SafeName, tt.wantSnake)
			}
			if n.ScreamingSnakeCase.UnsafeName != tt.wantScreaming {
				t.Errorf("ScreamingSnakeCase.UnsafeName: got %q, want %q", n.ScreamingSnakeCase.UnsafeName, tt.wantScreaming)
			}
		})
	}
}

func TestNameUnmarshalJSONString(t *testing.T) {
	resetCasingConfig()
	// Default smartCasing=false: no initialisms
	data, _ := json.Marshal("userId")
	var n Name
	if err := n.UnmarshalJSON(data); err != nil {
		t.Fatalf("UnmarshalJSON: %v", err)
	}
	if n.OriginalName != "userId" {
		t.Errorf("OriginalName: got %q, want %q", n.OriginalName, "userId")
	}
	if n.CamelCase == nil || n.CamelCase.UnsafeName != "userId" {
		t.Errorf("CamelCase.UnsafeName: got %v, want %q", n.CamelCase, "userId")
	}
}

func TestNameUnmarshalJSONObject(t *testing.T) {
	resetCasingConfig()
	v65JSON := `{"originalName":"userId","camelCase":{"unsafeName":"userId","safeName":"userId"},"pascalCase":{"unsafeName":"UserId","safeName":"UserId"},"snakeCase":{"unsafeName":"user_id","safeName":"user_id"},"screamingSnakeCase":{"unsafeName":"USER_ID","safeName":"USER_ID"}}`
	var n Name
	if err := json.Unmarshal([]byte(v65JSON), &n); err != nil {
		t.Fatalf("UnmarshalJSON: %v", err)
	}
	if n.OriginalName != "userId" {
		t.Errorf("OriginalName: got %q, want %q", n.OriginalName, "userId")
	}
	// v65 object preserves the original casings (no smart initialism recomputation)
	if n.CamelCase == nil || n.CamelCase.UnsafeName != "userId" {
		t.Errorf("CamelCase.UnsafeName: got %v, want %q", n.CamelCase, "userId")
	}
}

func TestNameAndWireValueUnmarshalJSONString(t *testing.T) {
	resetCasingConfig()
	data, _ := json.Marshal("user_id")
	var nwv NameAndWireValue
	if err := nwv.UnmarshalJSON(data); err != nil {
		t.Fatalf("UnmarshalJSON: %v", err)
	}
	if nwv.WireValue != "user_id" {
		t.Errorf("WireValue: got %q, want %q", nwv.WireValue, "user_id")
	}
	if nwv.Name == nil || nwv.Name.OriginalName != "user_id" {
		t.Errorf("Name.OriginalName: got %v, want %q", nwv.Name, "user_id")
	}
}

func TestNameAndWireValueUnmarshalJSONObjectWithStringName(t *testing.T) {
	resetCasingConfig()
	// v66 compressed format: wireValue differs from name, but name is still a string
	data := []byte(`{"wireValue":"user_id","name":"userName"}`)
	var nwv NameAndWireValue
	if err := json.Unmarshal(data, &nwv); err != nil {
		t.Fatalf("UnmarshalJSON: %v", err)
	}
	if nwv.WireValue != "user_id" {
		t.Errorf("WireValue: got %q, want %q", nwv.WireValue, "user_id")
	}
	if nwv.Name == nil || nwv.Name.OriginalName != "userName" {
		t.Errorf("Name.OriginalName: got %v, want %q", nwv.Name, "userName")
	}
}

func TestKeywordSanitization(t *testing.T) {
	resetCasingConfig()
	n := nameFromString("type")
	if n.CamelCase.SafeName != "type_" {
		t.Errorf("CamelCase.SafeName: got %q, want %q", n.CamelCase.SafeName, "type_")
	}
	if n.SnakeCase.SafeName != "type_" {
		t.Errorf("SnakeCase.SafeName: got %q, want %q", n.SnakeCase.SafeName, "type_")
	}
}

func TestNumberPrefix(t *testing.T) {
	resetCasingConfig()
	n := nameFromString("2factor")
	// camelCase("2factor") = "2Factor", then sanitizeName prepends "_" since it starts with a digit
	if n.CamelCase.SafeName != "_2Factor" {
		t.Errorf("CamelCase.SafeName: got %q, want %q", n.CamelCase.SafeName, "_2Factor")
	}
}
