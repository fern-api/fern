# frozen_string_literal: true

module Seed
  module Types
    class Level1Level2Person < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
      field :address, -> { Seed::Types::Level1Level2Address }, optional: false, nullable: false
    end
  end
end
