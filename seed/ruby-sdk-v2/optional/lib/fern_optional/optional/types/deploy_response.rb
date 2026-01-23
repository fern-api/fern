# frozen_string_literal: true

module FernOptional
  module Optional
    module Types
      class DeployResponse < Internal::Types::Model
        field :success, -> { Internal::Types::Boolean }, optional: false, nullable: false
      end
    end
  end
end
