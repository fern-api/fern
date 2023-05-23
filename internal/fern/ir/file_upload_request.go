package ir

type FileUploadRequest struct {
	Name       *Name                        `json:"name"`
	Properties []*FileUploadRequestProperty `json:"properties"`
}
