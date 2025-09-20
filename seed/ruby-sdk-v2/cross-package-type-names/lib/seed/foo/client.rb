# frozen_string_literal: true

module Seed
  module Foo
    class Client
      # @return [Seed::Foo::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Foo::Types::ImportingType]
      def find(request_options: {}, **params)
        params =
          _query_param_names = ["optionalString"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          query: _query,
          body: params
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Foo::Types::ImportingType.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
