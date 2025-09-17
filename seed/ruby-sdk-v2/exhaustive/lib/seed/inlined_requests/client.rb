# frozen_string_literal: true

module Seed
  module InlinedRequests
    class Client
      # @return [Seed::InlinedRequests::Client]
      def initialize(client:)
        @client = client
      end

      # POST with custom object in request body, response is an object
      #
      # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
      def post_with_object_bodyand_response(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/req-bodies/object",
          body: params
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
