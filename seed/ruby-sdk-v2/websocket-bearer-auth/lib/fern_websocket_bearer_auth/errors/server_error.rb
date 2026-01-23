# frozen_string_literal: true

module FernWebsocketBearerAuth
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
