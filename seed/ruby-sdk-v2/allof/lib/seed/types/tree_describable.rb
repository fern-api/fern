# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class TreeDescribable < Internal::Types::Model
      field :tree_name, -> { String }, optional: true, nullable: false, api_name: "treeName"

      field :tree_description, -> { String }, optional: true, nullable: false, api_name: "treeDescription"
    end
  end
end
