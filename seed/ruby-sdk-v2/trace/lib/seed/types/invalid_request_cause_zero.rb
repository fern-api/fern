# frozen_string_literal: true

module Seed
  module Types
    class InvalidRequestCauseZero < Internal::Types::Model
      field :type, -> { Seed::Types::InvalidRequestCauseZeroType }, optional: false, nullable: false
    end
  end
end
