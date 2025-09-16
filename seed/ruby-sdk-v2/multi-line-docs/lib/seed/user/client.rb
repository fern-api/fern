# frozen_string_literal: true

module Seed
  module User
    class Client
      # @return [Seed::User::Client]
      def initialize(client:)
        @client = client
      end

      # Retrieve a user.
      # This endpoint is used to retrieve a user.
      #
      # @return [untyped]
      def get_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "users/#{params[:userId]}"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Create a new user.
      # This endpoint is used to create a new user.
      #
      # @return [Seed::User::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "users",
          body: params
        )
        _response = @client.send(_request)
        return Seed::User::Types::User.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
