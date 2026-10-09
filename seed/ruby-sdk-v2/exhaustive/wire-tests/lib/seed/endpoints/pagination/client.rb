# frozen_string_literal: true

module Seed
  module Endpoints
    module Pagination
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # List items with cursor pagination
        #
        # Returns a `Seed::Internal::CursorItemIterator` that yields each
        # `Seed::Types::Object_::Types::ObjectWithRequiredField` in the `items` field of every page, requesting pages as
        # they are needed. Call `pages` on it to get each page as a
        # `Seed::Endpoints::Pagination::Types::PaginatedResponse`, including its other fields.
        #
        # No request is sent by this call. The first page is requested when you start iterating (or call
        # `load_first_page`), so an API error is raised by the loop (or by `load_first_page`), not by this call.
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String, nil] :cursor
        # @option params [Integer, nil] :limit
        #
        # @example
        #   client.endpoints.pagination.list_items(
        #     cursor: "cursor",
        #     limit: 1
        #   )
        #
        # @return [Seed::Internal::CursorItemIterator]
        def list_items(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          query_params["limit"] = params[:limit] if params.key?(:limit)

          Seed::Internal::CursorItemIterator.new(
            cursor_field: :next_,
            item_field: :items,
            initial_cursor: query_params["cursor"]
          ) do |next_cursor|
            query_params["cursor"] = next_cursor
            request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/pagination",
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
              parsed_response = (response.body.to_s.empty? ? nil : Seed::Endpoints::Pagination::Types::PaginatedResponse.load(response.body))
              [parsed_response, response]
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
