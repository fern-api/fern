# frozen_string_literal: true

module FernMultiUrlEnvironmentNoDefault
  module S3
    class Client
      # @param client [FernMultiUrlEnvironmentNoDefault::Internal::Http::RawClient]
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
      # @param params [FernMultiUrlEnvironmentNoDefault::S3::Types::GetPresignedUrlRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def get_presigned_url(request_options: {}, **params)
        params = FernMultiUrlEnvironmentNoDefault::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[s_3_key]
        body_bag = params.slice(*body_prop_names)

        request = FernMultiUrlEnvironmentNoDefault::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || @base_url || @environment&.dig(:s_3),
          method: "POST",
          path: "/s3/presigned-url",
          body: FernMultiUrlEnvironmentNoDefault::S3::Types::GetPresignedUrlRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernMultiUrlEnvironmentNoDefault::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernMultiUrlEnvironmentNoDefault::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
