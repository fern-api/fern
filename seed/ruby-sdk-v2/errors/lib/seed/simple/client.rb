# frozen_string_literal: true

module Seed
  module Simple
    class Client
      # @return [Seed::Simple::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Simple::Types::FooResponse]
      def foo_without_endpoint_error(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo1",
          body: Seed::Simple::Types::FooRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Simple::Types::FooResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Simple::Types::FooResponse]
      def foo(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo2",
          body: Seed::Simple::Types::FooRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Simple::Types::FooResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Simple::Types::FooResponse]
      def foo_with_examples(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "foo3",
          body: Seed::Simple::Types::FooRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Simple::Types::FooResponse.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
