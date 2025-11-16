# frozen_string_literal: true

module Seed
  module MultipartForm
    class Client
      # @return [Seed::MultipartForm::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def multipart_form(request_options: {}, **params)
        body = Internal::Multipart::FormData.new

        if params[:color]
          body.add(
            name: "color",
            value: params[:color]
          )
        end
        if params[:maybeColor]
          body.add(
            name: "maybeColor",
            value: params[:maybeColor]
          )
        end
        if params[:colorList]
          body.add(
            name: "colorList",
            value: params[:colorList]
          )
        end
        if params[:maybeColorList]
          body.add(
            name: "maybeColorList",
            value: params[:maybeColorList]
          )
        end

        _request = Seed::Internal::Multipart::Request.new(
          method: POST,
          path: "multipart",
          body: body
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
