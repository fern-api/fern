# frozen_string_literal: true

module Seed
  module Types
    class ExceptionV2Zero < Internal::Types::Model
      field :type, -> { Seed::Types::ExceptionV2ZeroType }, optional: false, nullable: false
    end
  end
end
