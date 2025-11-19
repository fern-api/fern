# frozen_string_literal: true

module Seed
  module Foo
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Foo::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Seed::Foo::Types::ImportingType]
      def find(request_options: {}, **params)
        _body_prop_names = %i[public_property private_property]
        _body_bag = params.slice(*_body_prop_names)

        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[optional_string]
        _query = {}
        _query["optionalString"] = params[:optional_string] if params.key?(:optional_string)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          query: _query,
          body: Seed::Foo::Types::FindRequest.new(_body_bag).to_h
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
