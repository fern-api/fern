# frozen_string_literal: true

module Seed
  module Nullable
    class Client
      # @return [Seed::Nullable::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Array[Seed::Nullable::Types::User]]
      def get_users(request_options: {}, **params)
        _query_param_names = %w[usernames avatar activated tags extra]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Nullable::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/users",
          body: params
        )
        _response = @client.send(_request)
        return Seed::Nullable::Types::User.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [bool]
      def delete_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "DELETE",
          path: "/users",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
