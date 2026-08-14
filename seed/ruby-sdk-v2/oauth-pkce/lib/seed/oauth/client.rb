# frozen_string_literal: true

module Seed
  module Oauth
    class Client
      # @param client [::Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Authorization-code grant with PKCE. `response_type` is a required literal that is
      # hardcoded by the generated method; `code_challenge_method` is an optional literal
      # that must still be sent on the wire when provided.
      #
      # @param request_options [::Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :response_type
      # @option params [String] :client_id
      # @option params [String] :redirect_uri
      # @option params [String] :code_challenge
      # @option params [String, nil] :code_challenge_method
      # @option params [String, nil] :scope
      # @option params [String, nil] :state
      #
      # @example
      #   client.oauth.authorize(
      #     response_type: "code",
      #     client_id: "client_abc123",
      #     redirect_uri: "https://example.com/callback",
      #     code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      #     code_challenge_method: "S256",
      #     scope: "read write",
      #     state: "xyz"
      #   )
      #
      # @return [::Seed::Types::AuthorizeResponse]
      def authorize(request_options: {}, **params)
        params = ::Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["response_type"] = params[:response_type] if params.key?(:response_type)
        query_params["client_id"] = params[:client_id] if params.key?(:client_id)
        query_params["redirect_uri"] = params[:redirect_uri] if params.key?(:redirect_uri)
        query_params["code_challenge"] = params[:code_challenge] if params.key?(:code_challenge)
        query_params["code_challenge_method"] = params[:code_challenge_method] if params.key?(:code_challenge_method)
        query_params["scope"] = params[:scope] if params.key?(:scope)
        query_params["state"] = params[:state] if params.key?(:state)

        request = ::Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "oauth/authorize",
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise ::Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          ::Seed::Types::AuthorizeResponse.load(response.body)
        else
          error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
