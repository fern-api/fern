# frozen_string_literal: true

module Seed
  module Errors
    module Types
      class UnauthorizedRequestErrorBody < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
