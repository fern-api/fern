# frozen_string_literal: true

module FernObjectsWithImports
  module Types
    class Node < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :label, -> { String }, optional: true, nullable: false
      field :metadata, -> { FernObjectsWithImports::Commons::Metadata::Types::Metadata }, optional: true, nullable: false
    end
  end
end
