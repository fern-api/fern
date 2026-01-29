# frozen_string_literal: true

module Seed
  module TestGroup
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Post a nullable request body
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :path_param
      # @option params [Seed::Types::PlainObject, nil] :query_param_object
      # @option params [Integer, nil] :query_param_integer
      #
      # @return [Object]
      def test_method_name(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        path_param_names = %i[path_param]
        body_params = params.except(*path_param_names)

        query_param_names = %i[query_param_object query_param_integer]
        query_params = {}
        query_params["query_param_object"] = params[:query_param_object] if params.key?(:query_param_object)
        query_params["query_param_integer"] = params[:query_param_integer] if params.key?(:query_param_integer)
        params = params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "optional-request-body/#{params[:path_param]}",
          query: query_params,
          body: body_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
