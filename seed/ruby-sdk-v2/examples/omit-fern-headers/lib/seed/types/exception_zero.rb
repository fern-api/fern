# frozen_string_literal: true

module Seed
  module Types
    class ExceptionZero < Internal::Types::Model
      field :type, -> { Seed::Types::ExceptionZeroType }, optional: false, nullable: false
    end
  end
end
