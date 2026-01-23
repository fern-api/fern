# frozen_string_literal: true

module FernSimpleFhir
  module Types
    class ResourceList < Internal::Types::Model
      extend FernSimpleFhir::Internal::Types::Union

      member -> { FernSimpleFhir::Types::Account }
      member -> { FernSimpleFhir::Types::Patient }
      member -> { FernSimpleFhir::Types::Practitioner }
      member -> { FernSimpleFhir::Types::Script }
    end
  end
end
