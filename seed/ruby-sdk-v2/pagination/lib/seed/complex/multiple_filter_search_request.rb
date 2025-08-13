
module Seed
    module Types
        class MultipleFilterSearchRequest < Internal::Types::Model
            field :operator, Seed::complex::MultipleFilterSearchRequestOperator, optional: true, nullable: false
            field :value, Seed::complex::MultipleFilterSearchRequestValue, optional: true, nullable: false

    end
end
