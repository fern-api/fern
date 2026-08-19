# frozen_string_literal: true

module <%= gem_namespace %>
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
