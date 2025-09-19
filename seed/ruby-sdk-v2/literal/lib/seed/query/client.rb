# frozen_string_literal: true

module Seed
  module Query
    class Client
      # @return [Seed::Query::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::SendResponse]
      def send_(request_options: {}, **params)
        params =
          _query_param_names = %w[prompt optional_prompt alias_prompt alias_optional_prompt query stream
                                  optional_stream alias_stream alias_optional_stream]
        _query = params.slice(*_query_param_names)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "query",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::SendResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
