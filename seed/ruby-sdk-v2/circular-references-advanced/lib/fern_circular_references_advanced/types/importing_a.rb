# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Types
    class ImportingA < Internal::Types::Model
      field :a, -> { FernCircularReferencesAdvanced::A::Types::A }, optional: true, nullable: false
    end
  end
end
