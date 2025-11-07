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
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[page per_page order starting_after]
          _query = {}
          _query["page"] = params[:page] if params.key?(:page)
          _query["per_page"] = params[:per_page] if params.key?(:per_page)
          _query["order"] = params[:order] if params.key?(:order)
          _query["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*_query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :starting_after,
            item_field: :users,
            initial_cursor: _query[:starting_after]
          ) do |next_cursor|
            _query[:starting_after] = next_cursor
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse]
        def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[cursor]
          _query = {}
          _query["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*_query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next,
            item_field: :users,
            initial_cursor: _query[:cursor]
          ) do |next_cursor|
            _query[:cursor] = next_cursor
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_cursor_pagination(request_options: {}, **params)
          _body_prop_names = %i[pagination]
          _body_bag = params.slice(*_body_prop_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :starting_after,
            item_field: :users,
            initial_cursor: _query[:cursor]
          ) do |next_cursor|
            _query[:cursor] = next_cursor
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              body: Seed::InlineUsers::InlineUsers::Types::ListUsersBodyCursorPaginationRequest.new(_body_bag).to_h
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[page per_page order starting_after]
          _query = {}
          _query["page"] = params[:page] if params.key?(:page)
          _query["per_page"] = params[:per_page] if params.key?(:per_page)
          _query["order"] = params[:order] if params.key?(:order)
          _query["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*_query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: _query[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            _query[:page] = next_page
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_double_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[page per_page order starting_after]
          _query = {}
          _query["page"] = params[:page] if params.key?(:page)
          _query["per_page"] = params[:per_page] if params.key?(:per_page)
          _query["order"] = params[:order] if params.key?(:order)
          _query["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*_query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: _query[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            _query[:page] = next_page
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_offset_pagination(request_options: {}, **params)
          _body_prop_names = %i[pagination]
          _body_bag = params.slice(*_body_prop_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: _query[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            _query[:page] = next_page
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              body: Seed::InlineUsers::InlineUsers::Types::ListUsersBodyOffsetPaginationRequest.new(_body_bag).to_h
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_step_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[page limit order]
          _query = {}
          _query["page"] = params[:page] if params.key?(:page)
          _query["limit"] = params[:limit] if params.key?(:limit)
          _query["order"] = params[:order] if params.key?(:order)
          params.except(*_query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: _query[:page],
            item_field: :users,
            has_next_field: nil,
            step: true
          ) do |next_page|
            _query[:page] = next_page
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination_has_next_page(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[page limit order]
          _query = {}
          _query["page"] = params[:page] if params.key?(:page)
          _query["limit"] = params[:limit] if params.key?(:limit)
          _query["order"] = params[:order] if params.key?(:order)
          params.except(*_query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: _query[:page],
            item_field: :users,
            has_next_field: :hasNextPage,
            step: true
          ) do |next_page|
            _query[:page] = next_page
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse]
        def list_with_extended_results(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[cursor]
          _query = {}
          _query["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*_query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next,
            item_field: :users,
            initial_cursor: _query[:cursor]
          ) do |next_cursor|
            _query[:cursor] = next_cursor
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse]
        def list_with_extended_results_and_optional_data(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[cursor]
          _query = {}
          _query["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*_query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next,
            item_field: :users,
            initial_cursor: _query[:cursor]
          ) do |next_cursor|
            _query[:cursor] = next_cursor
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::Types::UsernameCursor]
        def list_usernames(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[starting_after]
          _query = {}
          _query["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*_query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :after,
            item_field: :data,
            initial_cursor: _query[:starting_after]
          ) do |next_cursor|
            _query[:starting_after] = next_cursor
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::Types::UsernameCursor.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end

        # @return [Seed::InlineUsers::InlineUsers::Types::UsernameContainer]
        def list_with_global_config(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[offset]
          _query = {}
          _query["offset"] = params[:offset] if params.key?(:offset)
          params.except(*_query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: _query[:offset],
            item_field: :results,
            has_next_field: nil,
            step: false
          ) do |next_page|
            _query[:offset] = next_page
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::UsernameContainer.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end
      end
    end
  end
end
