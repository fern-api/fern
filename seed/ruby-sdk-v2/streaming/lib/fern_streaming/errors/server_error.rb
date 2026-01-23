# frozen_string_literal: true

module FernStreaming
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
