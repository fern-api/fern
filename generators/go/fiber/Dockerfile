# Stage 1: Build Node CLI
FROM node:22.12-alpine3.20 AS node

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

COPY generators/go-v2/sdk/dist/cli.cjs /dist/cli.cjs

# Stage 2: Final Go image
FROM golang:1.23.8-alpine3.20

WORKDIR /workspace

RUN apk add --no-cache ca-certificates git nodejs
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

COPY generators/go/go.mod generators/go/go.sum /workspace/
RUN go mod download

COPY generators/go/cmd /workspace/cmd
COPY generators/go/internal /workspace/internal
COPY generators/go/version.go /workspace/version.go

COPY generators/go-v2/sdk/features.yml /assets/features.yml

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Copy Node CLI from first stage and rename it /bin/go-v2
COPY --from=node /dist/cli.cjs /bin/go-v2
RUN chmod +x /bin/go-v2

RUN CGO_ENABLED=0 go build -ldflags "-s -w" -trimpath -buildvcs=false -o /fern-go-fiber ./cmd/fern-go-fiber

RUN test -f /bin/go-v2 || echo "go-v2 CLI not found or not executable"

RUN npm install -f -g @fern-api/generator-cli@0.2.0

ENTRYPOINT ["/fern-go-fiber"]
