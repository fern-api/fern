# frozen_string_literal: true

module Seed
  module Union
    class Client
      # @return [Seed::Union::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Union::Types::MyUnion]
      def get(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "",
          body: Seed::Union::Types::MyUnion.new(params).to_h
        )
        _response = @client.send(_request)
        return Seed::Union::Types::MyUnion.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Hash[Seed::Union::Types::Key, String]]
      def get_metadata(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/metadata"
        )
        _response = @client.send(_request)
        return Seed::Union::Types::Metadata.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [bool]
      def update_metadata(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PUT",
          path: "/metadata",
          body: Seed::Union::Types::MetadataUnion.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [bool]
      def call(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/call",
          body: Seed::Union::Types::Request.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Union::Types::UnionWithDuplicateTypes]
      def duplicate_types_union(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/duplicate",
          body: Seed::Union::Types::UnionWithDuplicateTypes.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Union::Types::UnionWithDuplicateTypes.load(_response.body)
        end

        raise _response.body
      end

      # @return [String]
      def nested_unions(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/nested",
          body: Seed::Union::Types::NestedUnionRoot.new(params).to_h
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
