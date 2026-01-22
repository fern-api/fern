# frozen_string_literal: true

module FernResponseProperty
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
