
module Seed
  module NullableOptional
    class Client
      # @return [Seed::NullableOptional::Client]
      def initialize(client:)
        @client = client
      end

      # Get a user by ID
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def get_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::UserResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Create a new user
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/users",
          body: Seed::NullableOptional::Types::CreateUserRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::UserResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Update a user (partial update)
      #
      # @return [Seed::NullableOptional::Types::UserResponse]
      def update_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "/api/users/#{params[:userId]}",
          body: Seed::NullableOptional::Types::UpdateUserRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::NullableOptional::Types::UserResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # List all users
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def list_users(request_options: {}, **params)
        _query_param_names = ["limit", "offset", "includeDeleted", "sortBy"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # Search users
      #
      # @return [Array[Seed::NullableOptional::Types::UserResponse]]
      def search_users(request_options: {}, **params)
        _query_param_names = ["query", "department", "role", "isActive"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/search",
          query: _query,
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
