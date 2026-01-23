# frozen_string_literal: true

module FernSimpleFhir
  module Types
    class Account < Internal::Types::Model
      field :resource_type, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :patient, -> { FernSimpleFhir::Types::Patient }, optional: true, nullable: false
      field :practitioner, -> { FernSimpleFhir::Types::Practitioner }, optional: true, nullable: false
    end
  end
end
