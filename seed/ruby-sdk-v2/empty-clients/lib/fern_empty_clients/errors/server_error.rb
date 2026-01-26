# frozen_string_literal: true

module FernEmptyClients
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
