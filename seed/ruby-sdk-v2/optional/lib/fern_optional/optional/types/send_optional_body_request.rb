# frozen_string_literal: true

module FernOptional
  module Optional
    module Types
      class SendOptionalBodyRequest < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
