# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class CronJob < Internal::Types::Model
        field :expression, -> { String }, optional: false, nullable: false
      end
    end
  end
end
