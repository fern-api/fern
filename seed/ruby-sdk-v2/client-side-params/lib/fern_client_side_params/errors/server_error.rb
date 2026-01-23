# frozen_string_literal: true

module FernClientSideParams
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
