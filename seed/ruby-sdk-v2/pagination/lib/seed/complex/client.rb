# frozen_string_literal: true

module Seed
  module Complex
    class Client
      # @return [Seed::Complex::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Complex::Types::PaginatedConversationResponse]
      def search(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "#{params[:index]}/conversations/search",
          body: Seed::Complex::Types::SearchRequest.new(params).to_h
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Complex::Types::PaginatedConversationResponse.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
