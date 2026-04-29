# frozen_string_literal: true

module Seed
  module Types
    class CreatePlantResponse < Internal::Types::Model
      field :id, -> { String }, optional: true, nullable: false

      field :name, -> { String }, optional: true, nullable: false
    end
  end
end
