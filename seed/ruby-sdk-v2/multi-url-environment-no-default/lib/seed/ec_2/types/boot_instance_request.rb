# frozen_string_literal: true

module Seed
  module Ec2
    module Types
      class BootInstanceRequest < Internal::Types::Model
        field :size, -> { String }, optional: false, nullable: false
      end
    end
  end
end
