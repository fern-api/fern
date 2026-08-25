# frozen_string_literal: true

module Seed
  module Complex
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Complex::Types::SearchRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :index
      #
      # @example
      #   client.complex.search(
      #     index: "index",
      #     pagination: {
      #       per_page: 1,
      #       starting_after: "starting_after"
      #     },
      #     query: {
      #       field: "field",
      #       operator: "=",
      #       value: "value"
      #     }
      #   )
      #
      # @return [Seed::Complex::Types::PaginatedConversationResponse]
      def search(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        path_param_names = %i[index]
        body_params = params.except(*path_param_names)

        Seed::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :conversations,
          initial_cursor: query_params["starting_after"]
        ) do |next_cursor|
          query_params["starting_after"] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "#{URI.encode_uri_component(params[:index].to_s)}/conversations/search",
            body: Seed::Complex::Types::SearchRequest.new(body_params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            parsed_response = Seed::Complex::Types::PaginatedConversationResponse.load(response.body)
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
