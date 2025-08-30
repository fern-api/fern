
module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # List resources with pagination
      #
      # @return [Array[Seed::Types::Types::Resource]]
      def list_resources(request_options: {}, **params)
        _query_param_names = ["page", "per_page", "sort", "order", "include_totals", "fields", "search"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/resources",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # Get a single resource
      #
      # @return [Seed::Types::Types::Resource]
      def get_resource(request_options: {}, **params)
        _query_param_names = ["include_metadata", "format"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/resources/#{params[:resourceId]}",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::Resource.load(_response.body)
        else
          raise _response.body
        end
      end

      # Search resources with complex parameters
      #
      # @return [Seed::Types::Types::SearchResponse]
      def search_resources(request_options: {}, **params)
        _query_param_names = ["limit", "offset"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/resources/search",
          query: _query,
          body: params,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::SearchResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # List or search for users
      #
      # @return [Seed::Types::Types::PaginatedUserResponse]
      def list_users(request_options: {}, **params)
        _query_param_names = ["page", "per_page", "include_totals", "sort", "connection", "q", "search_engine", "fields"]
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
          return Seed::Types::Types::PaginatedUserResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Get a user by ID
      #
      # @return [Seed::Types::Types::User]
      def get_user_by_id(request_options: {}, **params)
        _query_param_names = ["fields", "include_fields"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/users/#{params[:userId]}",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::User.load(_response.body)
        else
          raise _response.body
        end
      end

      # Create a new user
      #
      # @return [Seed::Types::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/api/users",
          body: Seed::Types::Types::CreateUserRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::User.load(_response.body)
        else
          raise _response.body
        end
      end

      # Update a user
      #
      # @return [Seed::Types::Types::User]
      def update_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "/api/users/#{params[:userId]}",
          body: Seed::Types::Types::UpdateUserRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::User.load(_response.body)
        else
          raise _response.body
        end
      end

      # Delete a user
      #
      # @return [untyped]
      def delete_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "DELETE",
          path: "/api/users/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

      # List all connections
      #
      # @return [Array[Seed::Types::Types::Connection]]
      def list_connections(request_options: {}, **params)
        _query_param_names = ["strategy", "name", "fields"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/connections",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # Get a connection by ID
      #
      # @return [Seed::Types::Types::Connection]
      def get_connection(request_options: {}, **params)
        _query_param_names = ["fields"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/connections/#{params[:connectionId]}",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::Connection.load(_response.body)
        else
          raise _response.body
        end
      end

      # List all clients/applications
      #
      # @return [Seed::Types::Types::PaginatedClientResponse]
      def list_clients(request_options: {}, **params)
        _query_param_names = ["fields", "include_fields", "page", "per_page", "include_totals", "is_global", "is_first_party", "app_type"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/clients",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::PaginatedClientResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Get a client by ID
      #
      # @return [Seed::Types::Types::Client]
      def get_client(request_options: {}, **params)
        _query_param_names = ["fields", "include_fields"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/api/clients/#{params[:clientId]}",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Types::Types::Client.load(_response.body)
        else
          raise _response.body
        end
      end

    end
  end
end
