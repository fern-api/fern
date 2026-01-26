# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Enum
      class Client
        # @param client [FernExhaustive::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [FernExhaustive::Types::Enum::Types::WeatherReport]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [FernExhaustive::Types::Enum::Types::WeatherReport]
        def get_and_return_enum(request_options: {}, **params)
          params = FernExhaustive::Internal::Types::Utils.normalize_keys(params)
          request = FernExhaustive::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/enum",
            body: params,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExhaustive::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernExhaustive::Types::Enum::Types::WeatherReport.load(response.body)
          else
            error_class = FernExhaustive::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
