# frozen_string_literal: true

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
      attr_reader :request_client

      # @param client [RequestClient]
      # @return [Endpoints::Client]
      def initialize(client:)
        @container_client = Endpoints::Container::ContainerClient.new(request_client: @request_client)
        @enum_client = Endpoints::Enum::EnumClient.new(request_client: @request_client)
        @http_methods_client = Endpoints::HttpMethods::HttpMethodsClient.new(request_client: @request_client)
        @object_client = Endpoints::Object::ObjectClient.new(request_client: @request_client)
        @params_client = Endpoints::Params::ParamsClient.new(request_client: @request_client)
        @primitive_client = Endpoints::Primitive::PrimitiveClient.new(request_client: @request_client)
        @union_client = Endpoints::Union::UnionClient.new(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return [Endpoints::AsyncClient]
      def initialize(client:)
        @async_container_client = Endpoints::Container::AsyncContainerClient.new(request_client: @request_client)
        @async_enum_client = Endpoints::Enum::AsyncEnumClient.new(request_client: @request_client)
        @async_http_methods_client = Endpoints::HttpMethods::AsyncHttpMethodsClient.new(request_client: @request_client)
        @async_object_client = Endpoints::Object::AsyncObjectClient.new(request_client: @request_client)
        @async_params_client = Endpoints::Params::AsyncParamsClient.new(request_client: @request_client)
        @async_primitive_client = Endpoints::Primitive::AsyncPrimitiveClient.new(request_client: @request_client)
        @async_union_client = Endpoints::Union::AsyncUnionClient.new(request_client: @request_client)
      end
    end
  end
end
