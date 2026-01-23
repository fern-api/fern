# frozen_string_literal: true

module FernSimpleFhir
  module Types
    class BaseResource < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :related_resources, -> { Internal::Types::Array[FernSimpleFhir::Types::ResourceList] }, optional: false, nullable: false
      field :memo, -> { FernSimpleFhir::Types::Memo }, optional: false, nullable: false
    end
  end
end
