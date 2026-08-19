# frozen_string_literal: true

module Seed
  module Types
    class TreeBase < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :tree_name, -> { String }, optional: true, nullable: false, api_name: "treeName"

      field :tree_description, -> { String }, optional: true, nullable: false, api_name: "treeDescription"

      field :tree_species, -> { String }, optional: true, nullable: false, api_name: "treeSpecies"

      field :height_in_feet, -> { Integer }, optional: true, nullable: false, api_name: "heightInFeet"
    end
  end
end
