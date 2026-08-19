export const PETSTORE_OPENAPI_YML = `openapi: 3.0.3
info:
  title: Petstore API
  version: 1.0.0
  description: A sample API for managing pets.

paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      tags:
        - pets
      parameters:
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            format: int32
            maximum: 100
          description: Maximum number of pets to return.
      responses:
        "200":
          description: A list of pets.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Pet"
        default:
          description: Unexpected error.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    post:
      summary: Create a pet
      operationId: createPet
      tags:
        - pets
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreatePetRequest"
      responses:
        "201":
          description: The created pet.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
        default:
          description: Unexpected error.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /pets/{petId}:
    get:
      summary: Get a pet by ID
      operationId: getPet
      tags:
        - pets
      parameters:
        - name: petId
          in: path
          required: true
          schema:
            type: string
          description: The ID of the pet to retrieve.
      responses:
        "200":
          description: The requested pet.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
        default:
          description: Unexpected error.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
          description: Unique identifier for the pet.
        name:
          type: string
          description: Name of the pet.
        tag:
          type: string
          description: Optional tag for the pet.
    CreatePetRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          description: Name of the pet.
        tag:
          type: string
          description: Optional tag for the pet.
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
          description: Error code.
        message:
          type: string
          description: Error message.
`;
