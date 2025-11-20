# frozen_string_literal: true

module Seed
  module Auth
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Auth::Client]
      def initialize(client:)
        @client = client
      end

      # @option params [String] :x_api_key
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Auth::Types::GetTokenRequest]
      #
      # @return [Seed::Auth::Types::TokenResponse]
      def get_token_with_client_credentials(request_options: {}, **params)
        _body_prop_names = %i[client_id client_secret audience grant_type scope]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token",
          body: Seed::Auth::Types::GetTokenRequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Auth::Types::TokenResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @option params [String] :x_api_key
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Auth::Types::RefreshTokenRequest]
      #
      # @return [Seed::Auth::Types::TokenResponse]
      def refresh_token(request_options: {}, **params)
        _body_prop_names = %i[client_id client_secret refresh_token audience grant_type scope]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/token/refresh",
          body: Seed::Auth::Types::RefreshTokenRequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Auth::Types::TokenResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
