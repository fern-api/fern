export declare namespace BrandGradient {
    export interface Props {
        size: string;
        position: string;
    }
}

export const BrandGradient: React.FC<BrandGradient.Props> = ({ size, position }) => {
    return (
        <div
            className="absolute inset-0"
            style={{
                background: `radial-gradient(${size} at ${position},rgba(175, 100, 239, 0.15),rgba(175, 100, 239, 0.05),transparent)`,
            }}
        />
    );
};
