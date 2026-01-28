# frozen_string_literal: true

module FernPagination
  module Users
    class Client
      # @param client [FernPagination::Internal::Http::RawClient]
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
      # @option params [FernPagination::Users::Types::Order, nil] :order
      # @option params [String, nil] :starting_after
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_cursor_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page per_page order starting_after]
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["order"] = params[:order] if params.key?(:order)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :data,
          initial_cursor: query_params[:starting_after]
        ) do |next_cursor|
          query_params[:starting_after] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernPagination::Users::Types::ListUsersMixedTypePaginationResponse]
      def list_with_mixed_type_cursor_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[cursor]
        query_params = {}
        query_params["cursor"] = params[:cursor] if params.key?(:cursor)
        params.except(*query_param_names)

        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :next_,
          item_field: :data,
          initial_cursor: query_params[:cursor]
        ) do |next_cursor|
          query_params[:cursor] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersMixedTypePaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end

      # @param request_options [Hash]
      # @param params [FernPagination::Users::Types::ListUsersBodyCursorPaginationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_body_cursor_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :data,
          initial_cursor: query_params[:cursor]
        ) do |next_cursor|
          query_params[:cursor] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users",
            body: FernPagination::Users::Types::ListUsersBodyCursorPaginationRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end

      # Pagination endpoint with a top-level cursor field in the request body.
      # This tests that the mock server correctly ignores cursor mismatches
      # when getNextPage() is called with a different cursor value.
      #
      # @param request_options [Hash]
      # @param params [FernPagination::Users::Types::ListUsersTopLevelBodyCursorPaginationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernPagination::Users::Types::ListUsersTopLevelCursorPaginationResponse]
      def list_with_top_level_body_cursor_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :next_cursor,
          item_field: :data,
          initial_cursor: query_params[:cursor]
        ) do |next_cursor|
          query_params[:cursor] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users/top-level-cursor",
            body: FernPagination::Users::Types::ListUsersTopLevelBodyCursorPaginationRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersTopLevelCursorPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [FernPagination::Users::Types::Order, nil] :order
      # @option params [String, nil] :starting_after
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_offset_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page per_page order starting_after]
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["order"] = params[:order] if params.key?(:order)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:page],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params[:page] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [FernPagination::Users::Types::Order, nil] :order
      # @option params [String, nil] :starting_after
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_double_offset_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page per_page order starting_after]
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["per_page"] = params[:per_page] if params.key?(:per_page)
        query_params["order"] = params[:order] if params.key?(:order)
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:page],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params[:page] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end

      # @param request_options [Hash]
      # @param params [FernPagination::Users::Types::ListUsersBodyOffsetPaginationRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_body_offset_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:page],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params[:page] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/users",
            body: FernPagination::Users::Types::ListUsersBodyOffsetPaginationRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [FernPagination::Users::Types::Order, nil] :order
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_offset_step_pagination(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page limit order]
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["order"] = params[:order] if params.key?(:order)
        params.except(*query_param_names)

        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:page],
          item_field: :data,
          has_next_field: nil,
          step: true
        ) do |next_page|
          query_params[:page] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [FernPagination::Users::Types::Order, nil] :order
      #
      # @return [FernPagination::Users::Types::ListUsersPaginationResponse]
      def list_with_offset_pagination_has_next_page(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page limit order]
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        query_params["limit"] = params[:limit] if params.key?(:limit)
        query_params["order"] = params[:order] if params.key?(:order)
        params.except(*query_param_names)

        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:page],
          item_field: :data,
          has_next_field: :has_next_page,
          step: true
        ) do |next_page|
          query_params[:page] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernPagination::Users::Types::ListUsersExtendedResponse]
      def list_with_extended_results(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[cursor]
        query_params = {}
        query_params["cursor"] = params[:cursor] if params.key?(:cursor)
        params.except(*query_param_names)

        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :next_,
          item_field: :users,
          initial_cursor: query_params[:cursor]
        ) do |next_cursor|
          query_params[:cursor] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersExtendedResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernPagination::Users::Types::ListUsersExtendedOptionalListResponse]
      def list_with_extended_results_and_optional_data(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[cursor]
        query_params = {}
        query_params["cursor"] = params[:cursor] if params.key?(:cursor)
        params.except(*query_param_names)

        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :next_,
          item_field: :users,
          initial_cursor: query_params[:cursor]
        ) do |next_cursor|
          query_params[:cursor] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersExtendedOptionalListResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernPagination::Types::UsernameCursor]
      def list_usernames(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[starting_after]
        query_params = {}
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :after,
          item_field: :data,
          initial_cursor: query_params[:starting_after]
        ) do |next_cursor|
          query_params[:starting_after] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Types::UsernameCursor.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernPagination::Types::UsernameCursor, nil]
      def list_usernames_with_optional_response(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[starting_after]
        query_params = {}
        query_params["starting_after"] = params[:starting_after] if params.key?(:starting_after)
        params.except(*query_param_names)

        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :after,
          item_field: :data,
          initial_cursor: query_params[:starting_after]
        ) do |next_cursor|
          query_params[:starting_after] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          unless code.between?(200, 299)
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      # @return [FernPagination::Users::Types::UsernameContainer]
      def list_with_global_config(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[offset]
        query_params = {}
        query_params["offset"] = params[:offset] if params.key?(:offset)
        params.except(*query_param_names)

        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:offset],
          item_field: :results,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params[:offset] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::UsernameContainer.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
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
      #
      # @return [FernPagination::Users::Types::ListUsersOptionalDataPaginationResponse]
      def list_with_optional_data(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[page]
        query_params = {}
        query_params["page"] = params[:page] if params.key?(:page)
        params.except(*query_param_names)

        FernPagination::Internal::OffsetItemIterator.new(
          initial_page: query_params[:page],
          item_field: :data,
          has_next_field: nil,
          step: false
        ) do |next_page|
          query_params[:page] = next_page
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/users/optional-data",
            query: query_params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Users::Types::ListUsersOptionalDataPaginationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
