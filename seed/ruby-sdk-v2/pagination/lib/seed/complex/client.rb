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
      # @return [Seed::Complex::Types::PaginatedConversationResponse]
      def search(request_options: {}, **params)
        Seed::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :conversations,
          initial_cursor: query_params[:starting_after]
        ) do |next_cursor|
          query_params[:starting_after] = next_cursor
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "#{params[:index]}/conversations/search",
            body: Seed::Complex::Types::SearchRequest.new(params).to_h
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Complex::Types::PaginatedConversationResponse.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
