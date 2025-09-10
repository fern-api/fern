# frozen_string_literal: true

module Seed
  module Ec2
    class Client
      # @return [Seed::Ec2::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def boot_instance(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/ec2/boot",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
