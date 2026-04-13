# frozen_string_literal: true

module Seed
  module Types
    class CommonsEventInfoZero < Internal::Types::Model
      field :type, -> { Seed::Types::CommonsEventInfoZeroType }, optional: false, nullable: false
    end
  end
end
