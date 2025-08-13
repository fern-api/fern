
module Seed
    module Types
        class SingleFilterSearchRequest < Internal::Types::Model
            field :field, String, optional: true, nullable: false
            field :operator, Seed::complex::SingleFilterSearchRequestOperator, optional: true, nullable: false
            field :value, String, optional: true, nullable: false

    end
end
