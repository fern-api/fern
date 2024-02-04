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
      # @return []
      def initialize(client:)
        @container_client = ContainerClient.initialize(request_client: @request_client)
        @enum_client = EnumClient.initialize(request_client: @request_client)
        @http_methods_client = HttpMethodsClient.initialize(request_client: @request_client)
        @object_client = ObjectClient.initialize(request_client: @request_client)
        @params_client = ParamsClient.initialize(request_client: @request_client)
        @primitive_client = PrimitiveClient.initialize(request_client: @request_client)
        @union_client = UnionClient.initialize(request_client: @request_client)
      end
    end

    class AsyncClient
      attr_reader :client

      # @param client [AsyncRequestClient]
      # @return []
      def initialize(client:)
        @async_container_client = AsyncContainerClient.initialize(request_client: @request_client)
        @async_enum_client = AsyncEnumClient.initialize(request_client: @request_client)
        @async_http_methods_client = AsyncHttpMethodsClient.initialize(request_client: @request_client)
        @async_object_client = AsyncObjectClient.initialize(request_client: @request_client)
        @async_params_client = AsyncParamsClient.initialize(request_client: @request_client)
        @async_primitive_client = AsyncPrimitiveClient.initialize(request_client: @request_client)
        @async_union_client = AsyncUnionClient.initialize(request_client: @request_client)
      end
    end
  end
end
