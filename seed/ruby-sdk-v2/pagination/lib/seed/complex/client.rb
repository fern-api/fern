# frozen_string_literal: true

module Seed
  module Complex
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Complex::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::Complex::Types::SearchRequest]
      #
      # @return [Seed::Complex::Types::PaginatedConversationResponse]
      def search(request_options: {}, **params)
        Seed::Internal::CursorItemIterator.new(
          cursor_field: :starting_after,
          item_field: :conversations,
          initial_cursor: _query[:starting_after]
        ) do |next_cursor|
          _query[:starting_after] = next_cursor
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "#{params[:index]}/conversations/search",
            body: Seed::Complex::Types::SearchRequest.new(params).to_h
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          if code.between?(200, 299)
            Seed::Complex::Types::PaginatedConversationResponse.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
