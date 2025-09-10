# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Types::Response]
      def get_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        return Seed::Service::Types::Response.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Service::Types::Response]
      def get_movie_docs(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        return Seed::Service::Types::Response.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Types::StringResponse]
      def get_movie_name(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        return Seed::Types::StringResponse.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Service::Types::Response]
      def get_movie_metadata(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        return Seed::Service::Types::Response.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Service::Types::Response | nil]
      def get_optional_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Service::Types::WithDocs | nil]
      def get_optional_movie_docs(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Service::Types::OptionalWithDocs.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Types::StringResponse | nil]
      def get_optional_movie_name(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "movie",
          body: params
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::OptionalStringResponse.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
