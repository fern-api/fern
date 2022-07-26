import { Button, Card, Intent } from "@blueprintjs/core";

export const App: React.FC = () => {
    return (
        <div>
            <Card interactive>I am a frontend!</Card>
            <Button text="button" intent={Intent.DANGER} />
        </div>
    );
};
