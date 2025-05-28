package internal

import (
	"encoding/json"
	"io"
	"mime/multipart"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const maxFormMemory = 32 << 20 // 32MB

type mockFile struct {
	name        string
	content     string
	contentType string

	reader io.Reader
}

func (f *mockFile) Read(p []byte) (n int, err error) {
	if f.reader == nil {
		f.reader = strings.NewReader(f.content)
	}
	return f.reader.Read(p)
}

func (f *mockFile) Name() string {
	return f.name
}

func (f *mockFile) ContentType() string {
	return f.contentType
}

func TestMultipartWriter(t *testing.T) {
	t.Run("empty", func(t *testing.T) {
		w := NewMultipartWriter()
		assert.NotNil(t, w.Buffer())
		assert.Contains(t, w.ContentType(), "multipart/form-data; boundary=")
		require.NoError(t, w.Close())
	})

	t.Run("write field", func(t *testing.T) {
		tests := []struct {
			desc            string
			giveField       string
			giveValue       string
			giveContentType string
		}{
			{
				desc:      "empty field",
				giveField: "empty",
				giveValue: "",
			},
			{
				desc:      "simple field",
				giveField: "greeting",
				giveValue: "hello world",
			},
			{
				desc:            "field with content type",
				giveField:       "message",
				giveValue:       "hello",
				giveContentType: "text/plain",
			},
		}

		for _, tt := range tests {
			t.Run(tt.desc, func(t *testing.T) {
				w := NewMultipartWriter()

				var opts []WriteMultipartOption
				if tt.giveContentType != "" {
					opts = append(opts, WithDefaultContentType(tt.giveContentType))
				}

				require.NoError(t, w.WriteField(tt.giveField, tt.giveValue, opts...))
				require.NoError(t, w.Close())

				reader := multipart.NewReader(w.Buffer(), w.writer.Boundary())
				form, err := reader.ReadForm(maxFormMemory)
				require.NoError(t, err)

				assert.Equal(t, []string{tt.giveValue}, form.Value[tt.giveField])
				require.NoError(t, form.RemoveAll())
			})
		}
	})

	t.Run("write file", func(t *testing.T) {
		tests := []struct {
			desc            string
			giveField       string
			giveFile        *mockFile
			giveContentType string
		}{
			{
				desc:      "simple file",
				giveField: "file",
				giveFile: &mockFile{
					name:        "test.txt",
					content:     "hello world",
					contentType: "text/plain",
				},
			},
			{
				desc:      "file content type takes precedence",
				giveField: "file",
				giveFile: &mockFile{
					name:        "test.txt",
					content:     "hello world",
					contentType: "text/plain",
				},
				giveContentType: "application/octet-stream",
			},
			{
				desc:      "default content type",
				giveField: "file",
				giveFile: &mockFile{
					name:    "test.txt",
					content: "hello world",
				},
				giveContentType: "application/octet-stream",
			},
		}

		for _, tt := range tests {
			t.Run(tt.desc, func(t *testing.T) {
				w := NewMultipartWriter()

				var opts []WriteMultipartOption
				if tt.giveContentType != "" {
					opts = append(opts, WithDefaultContentType(tt.giveContentType))
				}

				require.NoError(t, w.WriteFile(tt.giveField, tt.giveFile, opts...))
				require.NoError(t, w.Close())

				reader := multipart.NewReader(w.Buffer(), w.writer.Boundary())
				form, err := reader.ReadForm(maxFormMemory)
				require.NoError(t, err)
				defer func() {
					require.NoError(t, form.RemoveAll())
				}()

				files := form.File[tt.giveField]
				require.Len(t, files, 1)

				file := files[0]
				assert.Equal(t, tt.giveFile.name, file.Filename)

				f, err := file.Open()
				require.NoError(t, err)
				defer func() {
					require.NoError(t, f.Close())
				}()

				content, err := io.ReadAll(f)
				require.NoError(t, err)
				assert.Equal(t, tt.giveFile.content, string(content))

				expectedContentType := tt.giveFile.contentType
				if expectedContentType == "" {
					expectedContentType = tt.giveContentType
				}
				if expectedContentType != "" {
					assert.Equal(t, expectedContentType, file.Header.Get("Content-Type"))
				}
			})
		}
	})

	t.Run("write JSON", func(t *testing.T) {
		type testStruct struct {
			Name  string `json:"name"`
			Value int    `json:"value"`
		}

		tests := []struct {
			desc      string
			giveField string
			giveValue interface{}
		}{
			{
				desc:      "struct",
				giveField: "data",
				giveValue: testStruct{Name: "test", Value: 123},
			},
			{
				desc:      "map",
				giveField: "data",
				giveValue: map[string]string{"key": "value"},
			},
		}

		for _, tt := range tests {
			t.Run(tt.desc, func(t *testing.T) {
				w := NewMultipartWriter()

				require.NoError(t, w.WriteJSON(tt.giveField, tt.giveValue))
				require.NoError(t, w.Close())

				reader := multipart.NewReader(w.Buffer(), w.writer.Boundary())
				form, err := reader.ReadForm(maxFormMemory)
				require.NoError(t, err)
				defer func() {
					require.NoError(t, form.RemoveAll())
				}()

				expected, err := json.Marshal(tt.giveValue)
				require.NoError(t, err)
				assert.Equal(t, []string{string(expected)}, form.Value[tt.giveField])
			})
		}
	})

	t.Run("complex", func(t *testing.T) {
		w := NewMultipartWriter()

		// Add multiple fields and files
		require.NoError(t, w.WriteField("foo", "bar"))
		require.NoError(t, w.WriteField("baz", "qux"))

		hello := mockFile{name: "file.txt", content: "Hello, world!", contentType: "text/plain"}
		require.NoError(t, w.WriteFile("file", &hello))
		require.NoError(t, w.WriteJSON("data", map[string]string{"key": "value"}))
		require.NoError(t, w.Close())

		reader := multipart.NewReader(w.Buffer(), w.writer.Boundary())
		form, err := reader.ReadForm(maxFormMemory)
		require.NoError(t, err)
		defer func() {
			require.NoError(t, form.RemoveAll())
		}()

		assert.Equal(t, []string{"bar"}, form.Value["foo"])
		assert.Equal(t, []string{"qux"}, form.Value["baz"])
		assert.Equal(t, []string{`{"key":"value"}`}, form.Value["data"])

		files := form.File["file"]
		require.Len(t, files, 1)

		file := files[0]
		assert.Equal(t, "file.txt", file.Filename)

		f, err := file.Open()
		require.NoError(t, err)
		defer func() {
			require.NoError(t, f.Close())
		}()

		content, err := io.ReadAll(f)
		require.NoError(t, err)
		assert.Equal(t, "Hello, world!", string(content))
	})
}
