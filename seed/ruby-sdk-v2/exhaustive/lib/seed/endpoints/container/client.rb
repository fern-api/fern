# frozen_string_literal: true

module Seed
  module Endpoints
    module Container
      class Client
        # @return [Seed::Endpoints::Container::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/list-of-primitives",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/list-of-objects",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/set-of-primitives",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/set-of-objects",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/map-prim-to-prim",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/map-prim-to-object",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField | nil]
        def get_and_return_optional(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/container/opt-objects",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end
      end
    end
  end
end
