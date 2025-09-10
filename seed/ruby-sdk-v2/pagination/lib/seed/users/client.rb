# frozen_string_literal: true

module Seed
  module Users
    class Client
      # @return [Seed::Users::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_cursor_pagination(request_options: {}, **params)
        _query_param_names = %w[page per_page order starting_after]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersMixedTypePaginationResponse]
      def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
        _query_param_names = ["cursor"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersMixedTypePaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_body_cursor_pagination(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/users",
          body: params
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_offset_pagination(request_options: {}, **params)
        _query_param_names = %w[page per_page order starting_after]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_double_offset_pagination(request_options: {}, **params)
        _query_param_names = %w[page per_page order starting_after]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_body_offset_pagination(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/users",
          body: params
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_offset_step_pagination(request_options: {}, **params)
        _query_param_names = %w[page limit order]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersPaginationResponse]
      def list_with_offset_pagination_has_next_page(request_options: {}, **params)
        _query_param_names = %w[page limit order]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersPaginationResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersExtendedResponse]
      def list_with_extended_results(request_options: {}, **params)
        _query_param_names = ["cursor"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersExtendedResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Users::Types::ListUsersExtendedOptionalListResponse]
      def list_with_extended_results_and_optional_data(request_options: {}, **params)
        _query_param_names = ["cursor"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::ListUsersExtendedOptionalListResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Types::UsernameCursor]
      def list_usernames(request_options: {}, **params)
        _query_param_names = ["starting_after"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        return Seed::Types::UsernameCursor.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Users::Types::UsernameContainer]
      def list_with_global_config(request_options: {}, **params)
        _query_param_names = ["offset"]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/users",
          query: _query
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Users::Types::UsernameContainer.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
