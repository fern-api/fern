# frozen_string_literal: true

require_relative "../../requests"
require_relative "container/client"
require_relative "content_type/client"
require_relative "enum/client"
require_relative "http_methods/client"
require_relative "object/client"
require_relative "params/client"
require_relative "primitive/client"
require_relative "put/client"
require_relative "union/client"
require_relative "urls/client"

module SeedExhaustiveClient
  module Endpoints
    class Client
      # @return [SeedExhaustiveClient::Endpoints::ContainerClient]
      attr_reader :container
      # @return [SeedExhaustiveClient::Endpoints::ContentTypeClient]
      attr_reader :content_type
      # @return [SeedExhaustiveClient::Endpoints::EnumClient]
      attr_reader :enum
      # @return [SeedExhaustiveClient::Endpoints::HttpMethodsClient]
      attr_reader :http_methods
      # @return [SeedExhaustiveClient::Endpoints::ObjectClient]
      attr_reader :object
      # @return [SeedExhaustiveClient::Endpoints::ParamsClient]
      attr_reader :params
      # @return [SeedExhaustiveClient::Endpoints::PrimitiveClient]
      attr_reader :primitive
      # @return [SeedExhaustiveClient::Endpoints::PutClient]
      attr_reader :put
      # @return [SeedExhaustiveClient::Endpoints::UnionClient]
      attr_reader :union
      # @return [SeedExhaustiveClient::Endpoints::UrlsClient]
      attr_reader :urls

      # @param request_client [SeedExhaustiveClient::RequestClient]
      # @return [SeedExhaustiveClient::Endpoints::Client]
      def initialize(request_client:)
        @container = SeedExhaustiveClient::Endpoints::ContainerClient.new(request_client: request_client)
        @content_type = SeedExhaustiveClient::Endpoints::ContentTypeClient.new(request_client: request_client)
        @enum = SeedExhaustiveClient::Endpoints::EnumClient.new(request_client: request_client)
        @http_methods = SeedExhaustiveClient::Endpoints::HttpMethodsClient.new(request_client: request_client)
        @object = SeedExhaustiveClient::Endpoints::ObjectClient.new(request_client: request_client)
        @params = SeedExhaustiveClient::Endpoints::ParamsClient.new(request_client: request_client)
        @primitive = SeedExhaustiveClient::Endpoints::PrimitiveClient.new(request_client: request_client)
        @put = SeedExhaustiveClient::Endpoints::PutClient.new(request_client: request_client)
        @union = SeedExhaustiveClient::Endpoints::UnionClient.new(request_client: request_client)
        @urls = SeedExhaustiveClient::Endpoints::UrlsClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      # @return [SeedExhaustiveClient::Endpoints::AsyncContainerClient]
      attr_reader :container
      # @return [SeedExhaustiveClient::Endpoints::AsyncContentTypeClient]
      attr_reader :content_type
      # @return [SeedExhaustiveClient::Endpoints::AsyncEnumClient]
      attr_reader :enum
      # @return [SeedExhaustiveClient::Endpoints::AsyncHttpMethodsClient]
      attr_reader :http_methods
      # @return [SeedExhaustiveClient::Endpoints::AsyncObjectClient]
      attr_reader :object
      # @return [SeedExhaustiveClient::Endpoints::AsyncParamsClient]
      attr_reader :params
      # @return [SeedExhaustiveClient::Endpoints::AsyncPrimitiveClient]
      attr_reader :primitive
      # @return [SeedExhaustiveClient::Endpoints::AsyncPutClient]
      attr_reader :put
      # @return [SeedExhaustiveClient::Endpoints::AsyncUnionClient]
      attr_reader :union
      # @return [SeedExhaustiveClient::Endpoints::AsyncUrlsClient]
      attr_reader :urls

      # @param request_client [SeedExhaustiveClient::AsyncRequestClient]
      # @return [SeedExhaustiveClient::Endpoints::AsyncClient]
      def initialize(request_client:)
        @container = SeedExhaustiveClient::Endpoints::AsyncContainerClient.new(request_client: request_client)
        @content_type = SeedExhaustiveClient::Endpoints::AsyncContentTypeClient.new(request_client: request_client)
        @enum = SeedExhaustiveClient::Endpoints::AsyncEnumClient.new(request_client: request_client)
        @http_methods = SeedExhaustiveClient::Endpoints::AsyncHttpMethodsClient.new(request_client: request_client)
        @object = SeedExhaustiveClient::Endpoints::AsyncObjectClient.new(request_client: request_client)
        @params = SeedExhaustiveClient::Endpoints::AsyncParamsClient.new(request_client: request_client)
        @primitive = SeedExhaustiveClient::Endpoints::AsyncPrimitiveClient.new(request_client: request_client)
        @put = SeedExhaustiveClient::Endpoints::AsyncPutClient.new(request_client: request_client)
        @union = SeedExhaustiveClient::Endpoints::AsyncUnionClient.new(request_client: request_client)
        @urls = SeedExhaustiveClient::Endpoints::AsyncUrlsClient.new(request_client: request_client)
      end
    end
  end
end
