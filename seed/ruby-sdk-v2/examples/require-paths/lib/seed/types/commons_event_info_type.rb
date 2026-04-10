# frozen_string_literal: true

module Seed
  module Types
    class CommonsEventInfoType < Internal::Types::Model
      field :type, -> { Seed::Types::CommonsEventInfoTypeType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
