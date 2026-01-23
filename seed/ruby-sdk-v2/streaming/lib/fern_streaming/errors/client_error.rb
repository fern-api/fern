# frozen_string_literal: true

module FernStreaming
  module Errors
    class ClientError < ResponseError
    end

    class UnauthorizedError < ClientError
    end

    class ForbiddenError < ClientError
    end

    class NotFoundError < ClientError
    end
  end
end
