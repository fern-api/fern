# frozen_string_literal: true

module Seed
  module InlinedRequests
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::InlinedRequests::Client]
      def initialize(client:)
        @client = client
      end

      # POST with custom object in request body, response is an object
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::InlinedRequests::Types::PostWithObjectBody]
      #
      # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
      def post_with_object_bodyand_response(request_options: {}, **params)
        _body_prop_names = %i[string integer nested_object]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/req-bodies/object",
          body: Seed::InlinedRequests::Types::PostWithObjectBody.new(_body_bag).to_h
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
