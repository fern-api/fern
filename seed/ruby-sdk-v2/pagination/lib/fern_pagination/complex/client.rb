# frozen_string_literal: true

module FernPagination
  module Complex
    class Client
      # @param client [FernPagination::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernPagination::Complex::Types::SearchRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :index
      #
      # @return [FernPagination::Complex::Types::PaginatedConversationResponse]
      def search(request_options: {}, **params)
        params = FernPagination::Internal::Types::Utils.normalize_keys(params)
        FernPagination::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :conversations,
          initial_cursor: query_params[:starting_after]
        ) do |next_cursor|
          query_params[:starting_after] = next_cursor
          request = FernPagination::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "#{params[:index]}/conversations/search",
            body: FernPagination::Complex::Types::SearchRequest.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernPagination::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernPagination::Complex::Types::PaginatedConversationResponse.load(response.body)
          else
            error_class = FernPagination::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
