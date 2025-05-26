import { useState } from 'react';
import { parseGitHubUrl, fetchFileContent } from '../utils/github';
import { getCodeFeedback } from '../utils/ollama';
import FolderTree from './FolderTree';

const Form = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [ownerRepo, setOwnerRepo] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [challenge, setChallenge] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRepoFetch = () => {
        try {
            const { owner, repo } = parseGitHubUrl(repoUrl);
            setOwnerRepo({ owner, repo });
        } catch {
            alert('Invalid GitHub URL');
        }
    };

    const toggleFile = (filePath) => {
        setSelectedFiles((prev) =>
            prev.includes(filePath)
                ? prev.filter((f) => f !== filePath)
                : [...prev, filePath]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback('');

        try {
            const fileContents = {};
            for (const file of selectedFiles) {
                fileContents[file] = await fetchFileContent(
                    ownerRepo.owner,
                    ownerRepo.repo,
                    file
                );
            }

            const combinedCode = Object.values(fileContents).join('\n\n');
            const aiResponse = await getCodeFeedback(combinedCode, challenge);
            setFeedback(aiResponse);
        } catch (err) {
            console.error(err);
            setFeedback('Error while analyzing.');
        }

        setLoading(false);
    };

    const handleCopyAll = async () => {
        try {
            const fileContents = {};
            for (const file of selectedFiles) {
                fileContents[file] = await fetchFileContent(
                    ownerRepo.owner,
                    ownerRepo.repo,
                    file
                );
            }

            const combinedCode = Object.entries(fileContents)
                .map(([file, content]) => `// File: ${file}\n${content}`)
                .join('\n\n');

            await navigator.clipboard.writeText(combinedCode);
            alert('Code copied to clipboard!');
        } catch (err) {
            console.error(err);
            alert('Failed to copy code.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="xl:w-2xl lg:w-xl md:w-lg bg-blue-800 p-6 rounded-2xl shadow space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-white">AI Frontend Reviewer</h2>

            {/* GitHub Input */}
            <div>
                <label className="block font-medium mb-1 text-white">GitHub Repo URL:</label>
                <div className="flex gap-2 sm:flex-row flex-col">
                    <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/user/repo"
                        className="flex-1 px-3 py-2 border rounded"
                        required
                    />
                    <button
                        type="button"
                        onClick={handleRepoFetch}
                        className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
                    >
                        Load Repo
                    </button>
                </div>
            </div>

            {/* Folder Tree */}
            {ownerRepo && (
                <div>
                    <label className="block font-medium mb-2 text-white">Select files:</label>
                    <div className="max-h-64 overflow-auto border p-2 rounded">
                        <FolderTree
                            owner={ownerRepo.owner}
                            repo={ownerRepo.repo}
                            onFileToggle={toggleFile}
                            selectedFiles={selectedFiles}
                        />
                    </div>
                </div>
            )}

            {/* Selected files list and Copy button */}
            {selectedFiles.length > 0 && (
                <div className="p-2 rounded text-sm text-white">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">Selected files:</p>
                        <button
                            type="button"
                            onClick={handleCopyAll}
                            className="bg-gray-700 text-white px-3 py-1 text-sm rounded hover:bg-gray-800"
                        >
                            Copy All Code
                        </button>
                    </div>
                    <ul className="list-disc pl-5 mt-2">
                        {selectedFiles.map((file) => (
                            <li key={file}>{file}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Challenge input */}
            <div>
                <label className="block font-medium mb-1 text-white">
                    What challenge did you face?
                </label>
                <textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                />
            </div>

            {/* Screenshot upload */}
            <div className="flex items-center flex-wrap space-x-3">
                <label className="block font-medium mb-1 text-white">
                    Screenshot (optional):
                </label>
                <div className="overflow-hidden w-full max-w-[215px]">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshot(e.target.files[0])}
                        className="block cursor-pointer w-full text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                </div>
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 w-full"
            >
                {loading ? 'Analyzing...' : 'Get AI Feedback'}
            </button>

            {/* Feedback result */}
            {feedback && (
                <div className="mt-6 p-4 rounded border">
                    <h3 className="font-semibold mb-2">AI Feedback:</h3>
                    <pre className="whitespace-pre-wrap text-black">{feedback}</pre>
                </div>
            )}
        </form>
    );
};

export default Form;
