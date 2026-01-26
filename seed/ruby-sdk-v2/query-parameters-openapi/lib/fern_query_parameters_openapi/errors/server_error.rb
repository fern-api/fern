# frozen_string_literal: true

module FernQueryParametersOpenapi
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
