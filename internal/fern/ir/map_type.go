package ir

type MapType struct {
	KeyType   *TypeReference `json:"keyType"`
	ValueType *TypeReference `json:"valueType"`
}
