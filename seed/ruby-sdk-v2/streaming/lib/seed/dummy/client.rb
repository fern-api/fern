# frozen_string_literal: true

module Seed
  module Dummy
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Dummy::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Dummy::Types::GenerateStreamRequest]
      #
      # @return [untyped]
      def generate_stream(request_options: {}, **params)
        _body_prop_names = %i[stream num_events]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "generate-stream",
          body: Seed::Dummy::Types::GenerateStreamRequest.new(_body_bag).to_h
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

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Dummy::Types::Generateequest]
      #
      # @return [Seed::Dummy::Types::StreamResponse]
      def generate(request_options: {}, **params)
        _body_prop_names = %i[stream num_events]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "generate",
          body: Seed::Dummy::Types::Generateequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Dummy::Types::StreamResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
