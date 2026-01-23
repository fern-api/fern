# frozen_string_literal: true

module FernSimpleFhir
  module Types
    class Memo < Internal::Types::Model
      field :description, -> { String }, optional: false, nullable: false
      field :account, -> { FernSimpleFhir::Types::Account }, optional: true, nullable: false
    end
  end
end
