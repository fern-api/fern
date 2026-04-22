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
        # @return [Seed::Endpoints::Pagination::Types::PaginatedResponse]
        def list_items(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          query_param_names = %i[cursor limit]
          query_params = {}
          query_params["cursor"] = params[:cursor] if params.key?(:cursor)
          query_params["limit"] = params[:limit] if params.key?(:limit)
          params.except(*query_param_names)

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
              nil
              parsed_response = Seed::Endpoints::Pagination::Types::PaginatedResponse.load(response.body)
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
