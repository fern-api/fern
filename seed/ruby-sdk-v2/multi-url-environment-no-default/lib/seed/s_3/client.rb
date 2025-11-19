# frozen_string_literal: true

module Seed
  module S3
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::S3::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [String]
      def get_presigned_url(request_options: {}, **params)
        _body_prop_names = %i[s_3_key]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/s3/presigned-url",
          body: Seed::S3::Types::GetPresignedUrlRequest.new(_body_bag).to_h
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
