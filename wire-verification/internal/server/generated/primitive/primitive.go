package primitive

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PrimitiveService interface {
	ReflectString(request string) string

	ReflectInt(request int) int

	ReflectDouble(request float32) float32

	ReflectBoolean(request bool) bool

	ReflectLong(request int64) int64

	ReflectDatetime(request string) string

	ReflectUuid(request string) string
}

func RegisterPrimitiveService(router *gin.Engine, primitiveService PrimitiveService) {
	router.POST("/primitives/string", getReflectStringHandler(primitiveService))
	router.POST("/primitives/int", getReflectIntHandler(primitiveService))
	router.POST("/primitives/double", getReflectDoubleHandler(primitiveService))
	router.POST("/primitives/boolean", getReflectBooleanHandler(primitiveService))
	router.POST("/primitives/long", getReflectLongHandler(primitiveService))
	router.POST("/primitives/datetime", getReflectDatetimeHandler(primitiveService))
	router.POST("/primitives/uuid", getReflectUuidHandler(primitiveService))
}

func getReflectStringHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req string
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectString(req)
		c.JSON(http.StatusOK, res)
	}
}

func getReflectIntHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req int
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectInt(req)
		c.JSON(http.StatusOK, res)
	}
}

func getReflectDoubleHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req float32
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectDouble(req)
		c.JSON(http.StatusOK, res)
	}
}

func getReflectBooleanHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req bool
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectBoolean(req)
		c.JSON(http.StatusOK, res)
	}
}

func getReflectLongHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req int64
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectLong(req)
		c.JSON(http.StatusOK, res)
	}
}

func getReflectDatetimeHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req string
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectDatetime(req)
		c.JSON(http.StatusOK, res)
	}
}

func getReflectUuidHandler(primitiveService PrimitiveService) func(*gin.Context) {
	var req string
	return func(c *gin.Context) {
		err := json.NewDecoder(c.Request.Body).Decode(&req)
		if err != nil {
			http.Error(c.Writer, err.Error(), http.StatusBadRequest)
			return
		}
		res := primitiveService.ReflectString(req)
		c.JSON(http.StatusOK, res)
	}
}
