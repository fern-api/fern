# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :per_page
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page per_page order starting_after]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["per_page"] = params[:per_page] if params.key?(:per_page)
          query_params["order"] = params[:order] if params.key?(:order)
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :starting_after,
            item_field: :users,
            initial_cursor: query_params[:starting_after]
          ) do |next_cursor|
            query_params[:starting_after] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse]
        def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::InlineUsers::InlineUsers::Types::ListUsersBodyCursorPaginationRequest]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          body_prop_names = %i[pagination]
          body_bag = params.slice(*body_prop_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :starting_after,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              body: Seed::InlineUsers::InlineUsers::Types::ListUsersBodyCursorPaginationRequest.new(body_bag).to_h,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :per_page
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page per_page order starting_after]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["per_page"] = params[:per_page] if params.key?(:per_page)
          query_params["order"] = params[:order] if params.key?(:order)
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :per_page
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_double_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page per_page order starting_after]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["per_page"] = params[:per_page] if params.key?(:per_page)
          query_params["order"] = params[:order] if params.key?(:order)
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::InlineUsers::InlineUsers::Types::ListUsersBodyOffsetPaginationRequest]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          body_prop_names = %i[pagination]
          body_bag = params.slice(*body_prop_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              body: Seed::InlineUsers::InlineUsers::Types::ListUsersBodyOffsetPaginationRequest.new(body_bag).to_h,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :limit
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_step_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page limit order]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["limit"] = params[:limit] if params.key?(:limit)
          query_params["order"] = params[:order] if params.key?(:order)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: true
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :limit
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination_has_next_page(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page limit order]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["limit"] = params[:limit] if params.key?(:limit)
          query_params["order"] = params[:order] if params.key?(:order)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: :has_next_page,
            step: true
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse]
        def list_with_extended_results(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse]
        def list_with_extended_results_and_optional_data(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::Types::UsernameCursor]
        def list_usernames(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[starting_after]
          query_params = {}
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :after,
            item_field: :data,
            initial_cursor: query_params[:starting_after]
          ) do |next_cursor|
            query_params[:starting_after] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::Types::UsernameCursor.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :offset
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::UsernameContainer]
        def list_with_global_config(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[offset]
          query_params = {}
          query_params["offset"] = params[:offset] if params.key?(:offset)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:offset],
            item_field: :results,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:offset] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::UsernameContainer.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end
      end
    end
  end
end

module Seed
  module InlineUsers
    module InlineUsers
      class AsyncClient
        # @param client [Seed::Internal::Http::AsyncRawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :per_page
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page per_page order starting_after]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["per_page"] = params[:per_page] if params.key?(:per_page)
          query_params["order"] = params[:order] if params.key?(:order)
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :starting_after,
            item_field: :users,
            initial_cursor: query_params[:starting_after]
          ) do |next_cursor|
            query_params[:starting_after] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse]
        def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::InlineUsers::InlineUsers::Types::ListUsersBodyCursorPaginationRequest]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_cursor_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          body_prop_names = %i[pagination]
          body_bag = params.slice(*body_prop_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :starting_after,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              body: Seed::InlineUsers::InlineUsers::Types::ListUsersBodyCursorPaginationRequest.new(body_bag).to_h,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :per_page
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page per_page order starting_after]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["per_page"] = params[:per_page] if params.key?(:per_page)
          query_params["order"] = params[:order] if params.key?(:order)
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :per_page
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_double_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page per_page order starting_after]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["per_page"] = params[:per_page] if params.key?(:per_page)
          query_params["order"] = params[:order] if params.key?(:order)
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::InlineUsers::InlineUsers::Types::ListUsersBodyOffsetPaginationRequest]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_body_offset_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          body_prop_names = %i[pagination]
          body_bag = params.slice(*body_prop_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "POST",
              path: "/inline-users",
              body: Seed::InlineUsers::InlineUsers::Types::ListUsersBodyOffsetPaginationRequest.new(body_bag).to_h,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :limit
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_step_pagination(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page limit order]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["limit"] = params[:limit] if params.key?(:limit)
          query_params["order"] = params[:order] if params.key?(:order)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: nil,
            step: true
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :page
        # @option params [Integer, nil] :limit
        # @option params [Seed::InlineUsers::InlineUsers::Types::Order, nil] :order
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse]
        def list_with_offset_pagination_has_next_page(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[page limit order]
          query_params = {}
          query_params["page"] = params[:page] if params.key?(:page)
          query_params["limit"] = params[:limit] if params.key?(:limit)
          query_params["order"] = params[:order] if params.key?(:order)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:page],
            item_field: :users,
            has_next_field: :has_next_page,
            step: true
          ) do |next_page|
            query_params[:page] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse]
        def list_with_extended_results(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse]
        def list_with_extended_results_and_optional_data(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :users,
            initial_cursor: query_params[:cursor]
          ) do |next_cursor|
            query_params[:cursor] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :starting_after
        #
        # @return [Seed::Types::UsernameCursor]
        def list_usernames(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[starting_after]
          query_params = {}
          query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
          params.except(*query_param_names)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :after,
            item_field: :data,
            initial_cursor: query_params[:starting_after]
          ) do |next_cursor|
            query_params[:starting_after] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::Types::UsernameCursor.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Integer, nil] :offset
        #
        # @return [Seed::InlineUsers::InlineUsers::Types::UsernameContainer]
        def list_with_global_config(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[offset]
          query_params = {}
          query_params["offset"] = params[:offset] if params.key?(:offset)
          params.except(*query_param_names)

          Seed::Internal::OffsetItemIterator.new(
            initial_page: query_params[:offset],
            item_field: :results,
            has_next_field: nil,
            step: false
          ) do |next_page|
            query_params[:offset] = next_page
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/inline-users",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              Seed::InlineUsers::InlineUsers::Types::UsernameContainer.load(response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end
      end
    end
  end
end
