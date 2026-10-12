# frozen_string_literal: true

module Seed
  module Users
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :page
      # @option params [Integer, nil] :per_page
      # @option params [Seed::Users::Types::Order, nil] :order
      # @option params [String, nil] :starting_after
      #
      # @example
      #   client.users.list_with_cursor_pagination(
      #     page: 1,
      #     per_page: 1,
      #     order: "asc",
      #     starting_after: "starting_after"
      #   )
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_cursor_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["order"] = params[:order] if params.key?(:order)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :data,
          initial_cursor: query_params["starting_after"]
        ) do |next_cursor|
          query_params["starting_after"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersMixedTypePaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :cursor
      #
      # @example
      #   client.users.list_with_mixed_type_cursor_pagination(cursor: "cursor")
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["cursor"] = params[:cursor] if params.key?(:cursor)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :next_,
          item_field: :data,
          initial_cursor: query_params["cursor"]
        ) do |next_cursor|
          query_params["cursor"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersMixedTypePaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Seed::Users::Types::ListUsersBodyCursorPaginationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.users.list_with_mixed_type_cursor_pagination
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_body_cursor_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        Seed::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :data,
          initial_cursor: Seed::Internal::Types::Utils.normalize_keys(params[:pagination].to_h)[:cursor]
        ) do |next_cursor|
          params[:pagination] = Seed::Internal::Types::Utils.normalize_keys(params[:pagination].to_h).merge(cursor: next_cursor)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users",
            body: Seed::Users::Types::ListUsersBodyCursorPaginationRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Pagination endpoint with a top-level cursor field in the request body.
      # This tests that the mock server correctly ignores cursor mismatches
      # when getNextPage() is called with a different cursor value.
      #
      # Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersTopLevelCursorPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Seed::Users::Types::ListUsersTopLevelBodyCursorPaginationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.users.list_with_top_level_body_cursor_pagination(
      #     cursor: "initial_cursor",
      #     filter: "active"
      #   )
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_top_level_body_cursor_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        Seed::Internal::CursorItemIterator.new(
          cursor_field: :next_cursor,
          item_field: :data,
          initial_cursor: params[:cursor]
        ) do |next_cursor|
          params[:cursor] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users/top-level-cursor",
            body: Seed::Users::Types::ListUsersTopLevelBodyCursorPaginationRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersTopLevelCursorPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :page
      # @option params [Integer, nil] :per_page
      # @option params [Seed::Users::Types::Order, nil] :order
      # @option params [String, nil] :starting_after
      #
      # @example
      #   client.users.list_with_cursor_pagination(
      #     page: 1,
      #     per_page: 1,
      #     order: "asc",
      #     starting_after: "starting_after"
      #   )
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_offset_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["order"] = params[:order] if params.key?(:order)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)

        Seed::Internal::OffsetItemIterator.new(
          initial_page: query_params["page"],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params["page"] = next_page
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Float, nil] :page
      # @option params [Float, nil] :per_page
      # @option params [Seed::Users::Types::Order, nil] :order
      # @option params [String, nil] :starting_after
      #
      # @example
      #   client.users.list_with_cursor_pagination(
      #     page: 1.1,
      #     per_page: 1.1,
      #     order: "asc",
      #     starting_after: "starting_after"
      #   )
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_double_offset_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["order"] = params[:order] if params.key?(:order)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)

        Seed::Internal::OffsetItemIterator.new(
          initial_page: query_params["page"],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params["page"] = next_page
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Seed::Users::Types::ListUsersBodyOffsetPaginationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.users.list_with_mixed_type_cursor_pagination
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_body_offset_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        Seed::Internal::OffsetItemIterator.new(
          initial_page: Seed::Internal::Types::Utils.normalize_keys(params[:pagination].to_h)[:page],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          params[:pagination] = Seed::Internal::Types::Utils.normalize_keys(params[:pagination].to_h).merge(page: next_page)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users",
            body: Seed::Users::Types::ListUsersBodyOffsetPaginationRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :page
      # @option params [Integer, nil] :limit
      # @option params [Seed::Users::Types::Order, nil] :order
      #
      # @example
      #   client.users.list_with_cursor_pagination(
      #     page: 1,
      #     order: "asc"
      #   )
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_offset_step_pagination(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["order"] = params[:order] if params.key?(:order)

        Seed::Internal::OffsetItemIterator.new(
          initial_page: query_params["page"],
          item_field: :data,
          has_next_field: nil,
          step: true
        ) do |next_page|
          query_params["page"] = next_page
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :page
      # @option params [Integer, nil] :limit
      # @option params [Seed::Users::Types::Order, nil] :order
      #
      # @example
      #   client.users.list_with_cursor_pagination(
      #     page: 1,
      #     order: "asc"
      #   )
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_offset_pagination_has_next_page(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["order"] = params[:order] if params.key?(:order)

        Seed::Internal::OffsetItemIterator.new(
          initial_page: query_params["page"],
          item_field: :data,
          has_next_field: :has_next_page,
          step: true
        ) do |next_page|
          query_params["page"] = next_page
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `users` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersExtendedResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :cursor
      #
      # @example
      #   client.users.list_with_cursor_pagination
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_extended_results(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["cursor"] = params[:cursor] if params.key?(:cursor)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :next_,
          item_field: :users,
          initial_cursor: query_params["cursor"]
        ) do |next_cursor|
          query_params["cursor"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersExtendedResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `users` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersExtendedOptionalListResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :cursor
      #
      # @example
      #   client.users.list_with_cursor_pagination
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_extended_results_and_optional_data(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["cursor"] = params[:cursor] if params.key?(:cursor)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :next_,
          item_field: :users,
          initial_cursor: query_params["cursor"]
        ) do |next_cursor|
          query_params["cursor"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersExtendedOptionalListResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `String` in the `data` field of every page,
      # requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Types::UsernameCursor`,
      # including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :starting_after
      #
      # @example
      #   client.users.list_with_cursor_pagination(starting_after: "starting_after")
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_usernames(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :after,
          item_field: :data,
          initial_cursor: query_params["starting_after"]
        ) do |next_cursor|
          query_params["starting_after"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Types::UsernameCursor.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each `String` in the `data` field of every page,
      # requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Types::UsernameCursor`,
      # including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String, nil] :starting_after
      #
      # @example
      #   client.users.list_with_cursor_pagination(starting_after: "starting_after")
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_usernames_with_optional_response(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :after,
          item_field: :data,
          initial_cursor: query_params["starting_after"]
        ) do |next_cursor|
          query_params["starting_after"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Types::UsernameCursor.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `String` in the `results` field of every page,
      # requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::UsernameContainer`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :offset
      #
      # @example
      #   client.users.list_with_cursor_pagination
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_global_config(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["offset"] = params[:offset] if params.key?(:offset)

        Seed::Internal::OffsetItemIterator.new(
          initial_page: query_params["offset"],
          item_field: :results,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params["offset"] = next_page
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::UsernameContainer.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field
      # of every page, requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersOptionalDataPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :page
      #
      # @example
      #   client.users.list_with_optional_data(page: 1)
      #
      # @return [Seed::Internal::OffsetItemIterator]
      def list_with_optional_data(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)

        Seed::Internal::OffsetItemIterator.new(
          initial_page: query_params["page"],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params["page"] = next_page
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users/optional-data",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersOptionalDataPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end

      # Returns a `Seed::Internal::CursorItemIterator` that yields each item in the `data` field of every page,
      # requesting pages as they are needed. Call `pages` on it to get each page as a
      # `Seed::Users::Types::ListUsersAliasedDataPaginationResponse`, including its other fields.
      #
      # The request for the first page is sent by this call, so an API error for the first page is raised here. Later
      # pages are requested while iterating, and an API error for one of them is raised by the loop.
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Integer, nil] :page
      # @option params [Integer, nil] :per_page
      # @option params [String, nil] :starting_after
      #
      # @example
      #   client.users.list_with_aliased_data(
      #     page: 1,
      #     per_page: 1,
      #     starting_after: "starting_after"
      #   )
      #
      # @return [Seed::Internal::CursorItemIterator]
      def list_with_aliased_data(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :data,
          initial_cursor: query_params["starting_after"]
        ) do |next_cursor|
          query_params["starting_after"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users/aliased-data",
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
            parsed_response = (response.body.to_s.empty? ? nil : Seed::Users::Types::ListUsersAliasedDataPaginationResponse.load(response.body))
            [parsed_response, response]
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end.load_first_page
      end
    end
  end
end
