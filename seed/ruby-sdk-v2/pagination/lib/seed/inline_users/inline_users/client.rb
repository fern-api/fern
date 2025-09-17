# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      class Client
        # @return [Seed::InlineUsers::InlineUsers::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_cursor_pagination(request_options: {}, **params)
          _query_param_names = [
            %w[page per_page order starting_after],
            %i[page per_page order starting_after]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse]
        def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
          _query_param_names = [
            ["cursor"],
            %i[cursor]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_cursor_pagination(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/inline-users",
            body: params
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination(request_options: {}, **params)
          _query_param_names = [
            %w[page per_page order starting_after],
            %i[page per_page order starting_after]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_double_offset_pagination(request_options: {}, **params)
          _query_param_names = [
            %w[page per_page order starting_after],
            %i[page per_page order starting_after]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_offset_pagination(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/inline-users",
            body: params
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_step_pagination(request_options: {}, **params)
          _query_param_names = [
            %w[page limit order],
            %i[page limit order]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination_has_next_page(request_options: {}, **params)
          _query_param_names = [
            %w[page limit order],
            %i[page limit order]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse]
        def list_with_extended_results(request_options: {}, **params)
          _query_param_names = [
            ["cursor"],
            %i[cursor]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse]
        def list_with_extended_results_and_optional_data(request_options: {}, **params)
          _query_param_names = [
            ["cursor"],
            %i[cursor]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse.load(_response.body)
          end

          raise _response.body
        end

        # @return [Seed::Types::UsernameCursor]
        def list_usernames(request_options: {}, **params)
          _query_param_names = [
            ["starting_after"],
            %i[starting_after]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          return Seed::Types::UsernameCursor.load(_response.body) if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::UsernameContainer]
        def list_with_global_config(request_options: {}, **params)
          _query_param_names = [
            ["offset"],
            %i[offset]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/inline-users",
            query: _query
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::InlineUsers::InlineUsers::Types::UsernameContainer.load(_response.body)
          end

          raise _response.body
        end
      end
    end
  end
end
