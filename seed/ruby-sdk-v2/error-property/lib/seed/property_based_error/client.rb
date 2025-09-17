# frozen_string_literal: true

module Seed
  module PropertyBasedError
    class Client
      # @return [Seed::PropertyBasedError::Client]
      def initialize(client:)
        @client = client
      end

      # GET request that always throws an error
      #
      # @return [String]
      def throw_error(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "property-based-error"
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
