# frozen_string_literal: true

module Seed
  module Types
    class ErrorInfoOne < Internal::Types::Model
      field :type, -> { Seed::Types::ErrorInfoOneType }, optional: false, nullable: false
    end
  end
end
