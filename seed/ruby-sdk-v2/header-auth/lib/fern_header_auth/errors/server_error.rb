# frozen_string_literal: true

module FernHeaderAuth
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
