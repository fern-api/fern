# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Errors
    module Types
      class UnauthorizedRequestErrorBody < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
