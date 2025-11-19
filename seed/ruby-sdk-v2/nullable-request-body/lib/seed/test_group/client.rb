# frozen_string_literal: true

module Seed
  module TestGroup
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::TestGroup::Client]
      def initialize(client:)
        @client = client
      end

      # Post a nullable request body
      #
      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Hash[String, Object]]
      def test_method_name(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[query_param_object query_param_integer]
        _query = {}
        _query["query_param_object"] = params[:query_param_object] if params.key?(:query_param_object)
        _query["query_param_integer"] = params[:query_param_integer] if params.key?(:query_param_integer)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "optional-request-body/#{params[:path_param]}",
          query: _query,
          body: _body
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end
    end
  end
end
