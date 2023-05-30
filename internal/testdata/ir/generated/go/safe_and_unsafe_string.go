package ir

type SafeAndUnsafeString struct {
	// this name might overlap with reserved keywords of the language being generated
	UnsafeName string `json:"unsafeName"`
	// this name will NOT overlap with reserved keywords of the language being generated
	SafeName string `json:"safeName"`
}
