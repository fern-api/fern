# frozen_string_literal: true

module Seed
  module Query
    class Client
      # @return [Seed::Query::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::SendResponse]
      def send(request_options: {}, **params)
        _query_param_names = %w[prompt optional_prompt alias_prompt alias_optional_prompt query stream
                                optional_stream alias_stream alias_optional_stream]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "query",
          query: _query
        )
        _response = @client.send(_request)
        return Seed::Types::SendResponse.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
