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
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[prompt optional_prompt alias_prompt alias_optional_prompt query stream optional_stream
                                alias_stream alias_optional_stream]
        _query = {}
        _query["prompt"] = params[:prompt] if params.key?(:prompt)
        _query["optional_prompt"] = params[:optional_prompt] if params.key?(:optional_prompt)
        _query["alias_prompt"] = params[:alias_prompt] if params.key?(:alias_prompt)
        _query["alias_optional_prompt"] = params[:alias_optional_prompt] if params.key?(:alias_optional_prompt)
        _query["query"] = params[:query] if params.key?(:query)
        _query["stream"] = params[:stream] if params.key?(:stream)
        _query["optional_stream"] = params[:optional_stream] if params.key?(:optional_stream)
        _query["alias_stream"] = params[:alias_stream] if params.key?(:alias_stream)
        _query["alias_optional_stream"] = params[:alias_optional_stream] if params.key?(:alias_optional_stream)
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
