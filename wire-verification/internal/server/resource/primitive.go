package resource

type PrimitiveResource struct{}

func (primitiveResource *PrimitiveResource) ReflectString(request string) string {
	return request
}

func (primitiveResource *PrimitiveResource) ReflectInt(request int) int {
	return request
}

func (primitiveResource *PrimitiveResource) ReflectDouble(request float32) float32 {
	return request
}

func (primitiveResource *PrimitiveResource) ReflectBoolean(request bool) bool {
	return request
}

func (primitiveResource *PrimitiveResource) ReflectLong(request int64) int64 {
	return request
}

func (primitiveResource *PrimitiveResource) ReflectDatetime(request string) string {
	return request
}

func (primitiveResource *PrimitiveResource) ReflectUuid(request string) string {
	return request
}
