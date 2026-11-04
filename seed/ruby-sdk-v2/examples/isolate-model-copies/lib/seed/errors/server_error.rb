# frozen_string_literal: true

module Seed
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ResponseError
    end
  end
end
