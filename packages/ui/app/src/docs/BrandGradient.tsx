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
                background: `radial-gradient(${size} at ${position},rgba(var(--accent-primary), 0.15),rgba(var(--accent-primary), 0.05),transparent)`,
            }}
        />
    );
};
