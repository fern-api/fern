import { LoginButton } from "../auth/LoginButton";

export const LoginPage: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl mb-6">
                <span className="mr-2">🌿</span>Fern
            </div>
            <LoginButton />
        </div>
    );
};
