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
          base_url: request_options[:base_url] || Seed::Environment::PRODUCTION,
          method: "POST",
          path: "/ec2/boot",
          body: params
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
