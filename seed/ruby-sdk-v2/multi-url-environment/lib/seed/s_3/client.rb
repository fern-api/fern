# frozen_string_literal: true

module Seed
  module S3
    class Client
      # @return [Seed::S3::Client]
      def initialize(client:)
        @client = client
      end

      # @return [String]
      def get_presigned_url(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/s3/presigned-url",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
