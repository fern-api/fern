# frozen_string_literal: true

module Seed
  module Query
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :prompt
      # @option params [String, nil] :optional_prompt
      # @option params [Seed::Query::Types::AliasToPrompt] :alias_prompt
      # @option params [String, nil] :alias_optional_prompt
      # @option params [String] :query
      # @option params [Boolean] :stream
      # @option params [Boolean, nil] :optional_stream
      # @option params [Seed::Query::Types::AliasToStream] :alias_stream
      # @option params [Boolean, nil] :alias_optional_stream
      #
      # @return [Seed::Types::SendResponse]
      def send_(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        query_param_names = %i[prompt optional_prompt alias_prompt alias_optional_prompt query stream optional_stream alias_stream alias_optional_stream]
        query_params = {}
        query_params["prompt"] = params[:prompt] if params.key?(:prompt)
        query_params["optional_prompt"] = params[:optional_prompt] if params.key?(:optional_prompt)
        query_params["alias_prompt"] = params[:alias_prompt] if params.key?(:alias_prompt)
        query_params["alias_optional_prompt"] = params[:alias_optional_prompt] if params.key?(:alias_optional_prompt)
        query_params["query"] = params[:query] if params.key?(:query)
        query_params["stream"] = params[:stream] if params.key?(:stream)
        query_params["optional_stream"] = params[:optional_stream] if params.key?(:optional_stream)
        query_params["alias_stream"] = params[:alias_stream] if params.key?(:alias_stream)
        query_params["alias_optional_stream"] = params[:alias_optional_stream] if params.key?(:alias_optional_stream)
        params.except(*query_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "query",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::SendResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
