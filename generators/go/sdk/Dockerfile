# Stage 1: Build Node CLI
FROM node:20.18-alpine3.20 as node

RUN apk --no-cache add git zip \
  && git config --global user.name "fern" \
  && git config --global user.email "hey@buildwithfern.com"

COPY generators/go-v2/sdk/dist/cli.cjs /dist/cli.cjs

# Stage 2: Final Go image
FROM golang:1.22.7-alpine3.19

WORKDIR /workspace

RUN apk add --no-cache ca-certificates git nodejs

COPY go.mod go.sum /workspace/
RUN go mod download

COPY cmd /workspace/cmd
COPY internal /workspace/internal
COPY version.go /workspace/version.go

# Copy Node CLI from first stage
COPY --from=node /dist/cli.cjs /dist/cli.cjs

RUN CGO_ENABLED=0 go build -ldflags "-s -w" -trimpath -buildvcs=false -o /fern-go-sdk ./cmd/fern-go-sdk

ENTRYPOINT ["/fern-go-sdk"]