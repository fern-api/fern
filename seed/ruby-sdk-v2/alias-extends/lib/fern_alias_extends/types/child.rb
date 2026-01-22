# frozen_string_literal: true

module FernAliasExtends
  module Types
    class Child < Internal::Types::Model
      field :child, -> { String }, optional: false, nullable: false
    end
  end
end
