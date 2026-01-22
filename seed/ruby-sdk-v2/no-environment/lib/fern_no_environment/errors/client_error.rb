# frozen_string_literal: true

module FernNoEnvironment
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
