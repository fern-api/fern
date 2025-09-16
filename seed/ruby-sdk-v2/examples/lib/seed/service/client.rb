# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::Types::Movie]
      def get_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/movie/#{params[:movieId]}"
        )
        _response = @client.send(_request)
        return Seed::Types::Types::Movie.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [String]
      def create_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/movie",
          body: Seed::Types::Types::Movie.new(params).to_h
        )
        _response = @client.send(_request)
        return Seed::Types::Types::MovieId.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Types::Types::Metadata]
      def get_metadata(request_options: {}, **params)
        _query_param_names = [
          %w[shallow tag],
          %i[shallow tag]
        ].flatten
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/metadata",
          query: _query
        )
        _response = @client.send(_request)
        return Seed::Types::Types::Metadata.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Types::Types::Response]
      def create_big_entity(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/big-entity",
          body: Seed::Types::Types::BigEntity.new(params).to_h
        )
        _response = @client.send(_request)
        return Seed::Types::Types::Response.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [untyped]
      def refresh_token(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/refresh-token",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
