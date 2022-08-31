package main

import (
	"fmt"
	"verification/internal/server/generated/primitive"
	"verification/internal/server/resource"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	primitiveResource := &resource.PrimitiveResource{}
	primitive.RegisterPrimitiveService(router, primitiveResource)
	fmt.Printf("Starting server at port 8080\n")
	router.Run()
}
