package api

import (
	uuid "github.com/gofrs/uuid"
)

type Foo struct {
	Id          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	StringAlias String    `json:"stringAlias"`
}
