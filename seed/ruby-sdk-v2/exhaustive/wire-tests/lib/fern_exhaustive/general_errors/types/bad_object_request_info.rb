# frozen_string_literal: true

module FernExhaustive
  module GeneralErrors
    module Types
      class BadObjectRequestInfo < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
