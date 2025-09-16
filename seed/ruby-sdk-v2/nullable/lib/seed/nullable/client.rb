
module Seed
  module Nullable
    class Client
      # @return [Seed::Nullable::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Array[Seed::Nullable::Types::User]]
      def get_users(request_options: {}, **params)
        _query_param_names = [
          ["usernames", "avatar", "activated", "tags", "extra"],
          %i[usernames avatar activated tags extra]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "GET",
          path: "/users",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # @return [Seed::Nullable::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "POST",
          path: "/users",
          body: params,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Nullable::Types::User.load(_response.body)
        else
          raise _response.body
        end
      end

      # @return [bool]
      def delete_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url]
          ,
          method: "DELETE",
          path: "/users",
          body: params,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

    end
  end
end
