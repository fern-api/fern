# frozen_string_literal: true

require_relative "../../requests"
require_relative "container/client"
require_relative "enum/client"
require_relative "http_methods/client"
require_relative "object/client"
require_relative "params/client"
require_relative "primitive/client"
require_relative "union/client"

module SeedExhaustiveClient
  module Endpoints
    class Client
      attr_reader :container, :enum, :http_methods, :object, :params, :primitive, :union

      # @param request_client [RequestClient]
      # @return [Endpoints::Client]
      def initialize(request_client:)
        @container = Endpoints::ContainerClient.new(request_client: request_client)
        @enum = Endpoints::EnumClient.new(request_client: request_client)
        @http_methods = Endpoints::HttpMethodsClient.new(request_client: request_client)
        @object = Endpoints::ObjectClient.new(request_client: request_client)
        @params = Endpoints::ParamsClient.new(request_client: request_client)
        @primitive = Endpoints::PrimitiveClient.new(request_client: request_client)
        @union = Endpoints::UnionClient.new(request_client: request_client)
      end
    end

    class AsyncClient
      attr_reader :container, :enum, :http_methods, :object, :params, :primitive, :union

      # @param request_client [RequestClient]
      # @return [Endpoints::AsyncClient]
      def initialize(request_client:)
        @container = Endpoints::AsyncContainerClient.new(request_client: request_client)
        @enum = Endpoints::AsyncEnumClient.new(request_client: request_client)
        @http_methods = Endpoints::AsyncHttpMethodsClient.new(request_client: request_client)
        @object = Endpoints::AsyncObjectClient.new(request_client: request_client)
        @params = Endpoints::AsyncParamsClient.new(request_client: request_client)
        @primitive = Endpoints::AsyncPrimitiveClient.new(request_client: request_client)
        @union = Endpoints::AsyncUnionClient.new(request_client: request_client)
      end
    end
  end
end
