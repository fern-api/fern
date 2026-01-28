# frozen_string_literal: true

module FernMultiUrlEnvironment
  module Ec2
    class Client
      # @param client [FernMultiUrlEnvironment::Internal::Http::RawClient]
      # @param base_url [String, nil]
      # @param environment [Hash[Symbol, String], nil]
      #
      # @return [void]
      def initialize(client:, base_url: nil, environment: nil)
        @client = client
        @base_url = base_url
        @environment = environment
      end

      # @param request_options [Hash]
      # @param params [FernMultiUrlEnvironment::Ec2::Types::BootInstanceRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def boot_instance(request_options: {}, **params)
        params = FernMultiUrlEnvironment::Internal::Types::Utils.normalize_keys(params)
        request = FernMultiUrlEnvironment::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || @base_url || @environment&.dig(:ec_2),
          method: "POST",
          path: "/ec2/boot",
          body: FernMultiUrlEnvironment::Ec2::Types::BootInstanceRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMultiUrlEnvironment::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernMultiUrlEnvironment::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
