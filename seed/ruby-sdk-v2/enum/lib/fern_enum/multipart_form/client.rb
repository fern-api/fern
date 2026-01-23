# frozen_string_literal: true

module FernEnum
  module MultipartForm
    class Client
      # @param client [FernEnum::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [void]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def multipart_form(request_options: {}, **params)
        params = FernEnum::Internal::Types::Utils.normalize_keys(params)
        body = Internal::Multipart::FormData.new

        if params[:color]
          body.add(
            name: "color",
            value: params[:color]
          )
        end
        if params[:maybe_color]
          body.add(
            name: "maybeColor",
            value: params[:maybe_color]
          )
        end
        if params[:color_list]
          body.add(
            name: "colorList",
            value: params[:color_list]
          )
        end
        if params[:maybe_color_list]
          body.add(
            name: "maybeColorList",
            value: params[:maybe_color_list]
          )
        end

        request = FernEnum::Internal::Multipart::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "multipart",
          body: body,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernEnum::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernEnum::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
