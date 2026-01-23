# frozen_string_literal: true

module FernDollarStringExamples
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
