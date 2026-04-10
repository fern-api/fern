# frozen_string_literal: true

module Seed
  module Auth
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Auth::Types::AuthGetTokenWithClientCredentialsRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :api_key
      #
      # @return [Seed::Types::TokenResponse]
      def gettokenwithclientcredentials(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Auth::Types::AuthGetTokenWithClientCredentialsRequest.new(params).to_h
        non_body_param_names = ["X-Api-Key"]
        body = request_data.except(*non_body_param_names)

        headers = {}
        headers["X-Api-Key"] = params[:api_key] if params[:api_key]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "token",
          headers: headers,
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::TokenResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Auth::Types::AuthRefreshTokenRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :api_key
      #
      # @return [Seed::Types::TokenResponse]
      def refreshtoken(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Auth::Types::AuthRefreshTokenRequest.new(params).to_h
        non_body_param_names = ["X-Api-Key"]
        body = request_data.except(*non_body_param_names)

        headers = {}
        headers["X-Api-Key"] = params[:api_key] if params[:api_key]

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "token/refresh",
          headers: headers,
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::TokenResponse.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
