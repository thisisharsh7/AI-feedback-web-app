import { useState } from 'react';
import { parseGitHubUrl, fetchFileContent } from '../utils/github';
import { getCodeFeedback } from '../utils/ollama';
import FolderTree from './FolderTree';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Form = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [ownerRepo, setOwnerRepo] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [challenge, setChallenge] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [repoLoading, setRepoLoading] = useState(false);

    const handleRepoFetch = async () => {
        try {
            setRepoLoading(true);
            setSelectedFiles([]);
            setOwnerRepo(null); // Clear old data
            const { owner, repo } = parseGitHubUrl(repoUrl);
            // Simulate delay so loader is visible (remove in production)
            await new Promise((res) => setTimeout(res, 300));
            setOwnerRepo({ owner, repo });
        } catch {
            alert('Invalid GitHub URL');
        } finally {
            setRepoLoading(false);
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
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl w-full mx-auto bg-white p-8 rounded-3xl shadow-2xl space-y-8 border border-gray-200"
        >
            <h2 className="text-3xl font-bold text-center text-gray-800">🚀 AI Frontend Reviewer</h2>

            {/* GitHub Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">GitHub Repo URL:</label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/user/repo"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                        required
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleRepoFetch}
                        disabled={repoLoading}
                        className="px-4 py-2 bg-black text-white rounded-lg transition-all shadow flex items-center gap-2"
                    >
                        {repoLoading ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                Loading...
                            </>
                        ) : (
                            'Load Repo'
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Folder Tree */}
            <AnimatePresence>
                {ownerRepo && !repoLoading && (
                    <motion.div
                        key={`${ownerRepo.owner}/${ownerRepo.repo}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                    >
                        <label className="text-sm font-medium text-gray-700">Select files:</label>
                        <div className="max-h-64 overflow-auto border border-gray-200 bg-gray-50 p-3 rounded-xl mt-2 shadow-inner">
                            <FolderTree
                                key={`${ownerRepo.owner}/${ownerRepo.repo}`}
                                owner={ownerRepo.owner}
                                repo={ownerRepo.repo}
                                onFileToggle={toggleFile}
                                selectedFiles={selectedFiles}
                                fileIcon="📘"
                                fileTextColor="text-blue-700"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected Files */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
                    <motion.div
                        key="selected-files"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-2"
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-700">✅ Selected Files:</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={handleCopyAll}
                                className="text-sm px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
                            >
                                Copy All Code
                            </motion.button>
                        </div>
                        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                            {selectedFiles.map((file) => (
                                <li key={file}>{file}</li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Challenge Textarea */}
            <div>
                <label className="text-sm font-medium text-gray-700">🧠 What challenge did you face?</label>
                <textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    rows={4}
                    placeholder="Describe your challenge..."
                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-800 placeholder-gray-400"
                />
            </div>

            {/* Screenshot Upload */}
            <div>
                <label className="text-sm font-medium text-gray-700">📷 Upload Screenshot (optional):</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    className="block w-full text-sm text-gray-800 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-black file:text-white  transition"
                />
            </div>

            {/* Submit */}
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
                {loading ? 'Analyzing...' : 'Get AI Feedback'}
            </motion.button>

            {/* Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4 }}
                        className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">🧾 AI Feedback:</h3>
                        <pre className="whitespace-pre-wrap text-gray-800 text-sm font-mono">{feedback}</pre>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    );
};

export default Form;
