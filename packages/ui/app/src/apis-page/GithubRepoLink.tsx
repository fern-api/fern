import { BsGithub } from "react-icons/bs";

export const GithubRepoLink: React.FC = () => {
    return (
        <a
            className="flex items-center gap-2 cursor-pointer hover:underline"
            href="https://google.com"
            target="_blank"
            rel="noreferrer noopener"
        >
            <BsGithub />
            <div>fern-api/fern</div>
        </a>
    );
};
