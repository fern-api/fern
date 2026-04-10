# frozen_string_literal: true

module Seed
  module Sysprop
    module Types
      class SyspropSetNumWarmInstancesRequest < Internal::Types::Model
        field :language, -> { Seed::Types::Language }, optional: false, nullable: false
        field :num_warm_instances, -> { Integer }, optional: false, nullable: false, api_name: "numWarmInstances"
      end
    end
  end
end
