# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # List resources with pagination
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Array[Seed::Types::Types::Resource]]
      def list_resources(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[page per_page sort order include_totals fields search]
        _query = {}
        _query["page"] = params[:page] if params.key?(:page)
        _query["per_page"] = params[:per_page] if params.key?(:per_page)
        _query["sort"] = params[:sort] if params.key?(:sort)
        _query["order"] = params[:order] if params.key?(:order)
        _query["include_totals"] = params[:include_totals] if params.key?(:include_totals)
        _query["fields"] = params[:fields] if params.key?(:fields)
        _query["search"] = params[:search] if params.key?(:search)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/resources",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Get a single resource
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Types::Types::Resource]
      def get_resource(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[include_metadata format]
        _query = {}
        _query["include_metadata"] = params[:include_metadata] if params.key?(:include_metadata)
        _query["format"] = params[:format] if params.key?(:format)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/resources/#{params[:resource_id]}",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Resource.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Search resources with complex parameters
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Service::Types::SearchResourcesRequest]
      #
      # @return [Seed::Types::Types::SearchResponse]
      def search_resources(request_options: {}, **params)
        _body_prop_names = %i[query filters]
        _body_bag = params.slice(*_body_prop_names)

        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[limit offset]
        _query = {}
        _query["limit"] = params[:limit] if params.key?(:limit)
        _query["offset"] = params[:offset] if params.key?(:offset)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/resources/search",
          query: _query,
          body: Seed::Service::Types::SearchResourcesRequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::SearchResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # List or search for users
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Types::Types::PaginatedUserResponse]
      def list_users(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[page per_page include_totals sort connection q search_engine fields]
        _query = {}
        _query["page"] = params[:page] if params.key?(:page)
        _query["per_page"] = params[:per_page] if params.key?(:per_page)
        _query["include_totals"] = params[:include_totals] if params.key?(:include_totals)
        _query["sort"] = params[:sort] if params.key?(:sort)
        _query["connection"] = params[:connection] if params.key?(:connection)
        _query["q"] = params[:q] if params.key?(:q)
        _query["search_engine"] = params[:search_engine] if params.key?(:search_engine)
        _query["fields"] = params[:fields] if params.key?(:fields)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::PaginatedUserResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Get a user by ID
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Types::Types::User]
      def get_user_by_id(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[fields include_fields]
        _query = {}
        _query["fields"] = params[:fields] if params.key?(:fields)
        _query["include_fields"] = params[:include_fields] if params.key?(:include_fields)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/users/#{params[:user_id]}",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::User.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Create a new user
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Types::Types::CreateUserRequest]
      #
      # @return [Seed::Types::Types::User]
      def create_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/api/users",
          body: Seed::Types::Types::CreateUserRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::User.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Update a user
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Types::Types::UpdateUserRequest]
      #
      # @return [Seed::Types::Types::User]
      def update_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/api/users/#{params[:user_id]}",
          body: Seed::Types::Types::UpdateUserRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::User.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Delete a user
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def delete_user(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/api/users/#{params[:user_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # List all connections
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Array[Seed::Types::Types::Connection]]
      def list_connections(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[strategy name fields]
        _query = {}
        _query["strategy"] = params[:strategy] if params.key?(:strategy)
        _query["name"] = params[:name] if params.key?(:name)
        _query["fields"] = params[:fields] if params.key?(:fields)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/connections",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Get a connection by ID
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Types::Types::Connection]
      def get_connection(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[fields]
        _query = {}
        _query["fields"] = params[:fields] if params.key?(:fields)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/connections/#{params[:connection_id]}",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Connection.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # List all clients/applications
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Types::Types::PaginatedClientResponse]
      def list_clients(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[fields include_fields page per_page include_totals is_global is_first_party app_type]
        _query = {}
        _query["fields"] = params[:fields] if params.key?(:fields)
        _query["include_fields"] = params[:include_fields] if params.key?(:include_fields)
        _query["page"] = params[:page] if params.key?(:page)
        _query["per_page"] = params[:per_page] if params.key?(:per_page)
        _query["include_totals"] = params[:include_totals] if params.key?(:include_totals)
        _query["is_global"] = params[:is_global] if params.key?(:is_global)
        _query["is_first_party"] = params[:is_first_party] if params.key?(:is_first_party)
        _query["app_type"] = params[:app_type] if params.key?(:app_type)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/clients",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::PaginatedClientResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Get a client by ID
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Types::Types::Client]
      def get_client(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[fields include_fields]
        _query = {}
        _query["fields"] = params[:fields] if params.key?(:fields)
        _query["include_fields"] = params[:include_fields] if params.key?(:include_fields)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/api/clients/#{params[:client_id]}",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Client.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
