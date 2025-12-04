# frozen_string_literal: true

module Seed
  module InlinedRequests
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # POST with custom object in request body, response is an object
      #
      # @param request_options [Hash]
      # @param params [Seed::InlinedRequests::Types::PostWithObjectBody]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
      def post_with_object_bodyand_response(request_options: {}, **params)
        body_prop_names = %i[string integer nested_object]
        body_bag = params.slice(*body_prop_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/req-bodies/object",
          body: Seed::InlinedRequests::Types::PostWithObjectBody.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
