# frozen_string_literal: true

module Seed
  module Types
    class JSON_ < Internal::Types::Model
      field :docs, -> { String }, optional: false, nullable: false

      field :raw, -> { String }, optional: false, nullable: false
    end
  end
end
